import Loan from '../models/Loan.js';
import User from '../models/User.js';

export async function getFriends(req, res) {
  const userId = req.user.userId;
  const me = await User.findById(userId, 'email');

  const loans = await Loan.find({
    $or: [
      { 'lender.userId':   userId },
      { 'borrower.userId': userId },
      { 'lender.email':   me.email },
      { 'borrower.email': me.email },
    ],
  });

  // Agrège les compteurs par contrepartie, identifiée par (userId ?? email ?? name)
  const map = new Map(); // clé = userId_or_email_or_name

  for (const loan of loans) {
    const doc = loan.toObject();
    const amCreator = doc.createdBy.toString() === userId.toString();
    const effectiveKind = amCreator ? doc.kind : (doc.kind === 'loan' ? 'borrow' : 'loan');
    const otherParty = effectiveKind === 'loan' ? doc.borrower : doc.lender;

    // Clé stable pour dédupliquer
    const key = otherParty.userId?.toString() ?? otherParty.email ?? otherParty.name;
    if (!map.has(key)) {
      map.set(key, {
        userId: otherParty.userId ?? null,
        email:  otherParty.email  ?? null,
        name:   otherParty.name,
        loansActive:   0,
        loansDone:     0,
        borrowsActive: 0,
        borrowsDone:   0,
      });
    }

    const entry = map.get(key);
    const done = !!doc.returnedAt;

    if (effectiveKind === 'loan') {
      done ? entry.loansDone++ : entry.loansActive++;
    } else {
      done ? entry.borrowsDone++ : entry.borrowsActive++;
    }
  }

  // Résoudre les noms et emails courants depuis la base
  const friends = await Promise.all(
    [...map.values()].map(async (f) => {
      if (f.userId) {
        const user = await User.findById(f.userId, 'email username');
        if (user) {
          return { ...f, name: user.username || user.email, email: user.email };
        }
      } else if (f.email) {
        const user = await User.findOne({ email: f.email, isVerified: true }, 'email username');
        if (user) {
          return { ...f, name: user.username || user.email };
        }
      }
      return f;
    })
  );

  // Tri : actifs d'abord, puis alphabétique
  friends.sort((a, b) => {
    const aActive = a.loansActive + a.borrowsActive;
    const bActive = b.loansActive + b.borrowsActive;
    if (bActive !== aActive) return bActive - aActive;
    return a.name.localeCompare(b.name);
  });

  return res.status(200).json({ data: friends, error: null, message: null });
}
