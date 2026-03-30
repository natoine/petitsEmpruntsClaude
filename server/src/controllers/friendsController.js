import Loan from '../models/Loan.js';
import User from '../models/User.js';

export async function getFriendHistory(req, res) {
  const userId = req.user.userId;
  const me = await User.findById(userId, 'email');

  const { friendUserId, friendEmail, friendName } = req.query;

  // Construire le filtre pour retrouver les prêts entre moi et cet ami
  const meFilter = [
    { 'lender.userId': userId },
    { 'borrower.userId': userId },
    { 'lender.email': me.email },
    { 'borrower.email': me.email },
  ];

  let friendFilter = [];
  if (friendUserId) {
    friendFilter = [
      { 'lender.userId': friendUserId },
      { 'borrower.userId': friendUserId },
    ];
  } else if (friendEmail) {
    friendFilter = [
      { 'lender.email': friendEmail },
      { 'borrower.email': friendEmail },
    ];
  } else if (friendName) {
    friendFilter = [
      { 'lender.name': friendName },
      { 'borrower.name': friendName },
    ];
  } else {
    return res.status(400).json({ data: null, error: 'MISSING_PARAMS', message: 'Identifiant ami requis.' });
  }

  const loans = await Loan.find({
    $and: [
      { $or: meFilter },
      { $or: friendFilter },
    ],
  }).sort({ createdAt: 1 });

  // Résoudre le nom de l'ami pour l'affichage
  let friendDisplayName = friendName ?? friendEmail ?? '?';
  if (friendUserId) {
    const u = await User.findById(friendUserId, 'email username');
    if (u) friendDisplayName = u.username || u.email;
  } else if (friendEmail) {
    const u = await User.findOne({ email: friendEmail, isVerified: true }, 'email username');
    if (u) friendDisplayName = u.username || u.email;
  }

  // Aplatir chaque prêt en 1 ou 2 événements
  const events = [];

  for (const loan of loans) {
    const doc = loan.toObject();
    const amCreator = doc.createdBy.toString() === userId.toString();
    const effectiveKind = amCreator ? doc.kind : (doc.kind === 'loan' ? 'borrow' : 'loan');

    // Événement création
    events.push({
      date: doc.createdAt,
      type: effectiveKind === 'loan' ? 'loaned' : 'borrowed',
      what: doc.what,
      loanId: doc._id,
    });

    // Événement rendu
    if (doc.returnedAt) {
      // Qui a rendu ? Celui qui a emprunté rend → si j'ai prêté, c'est lui qui rend (il_a_rendu)
      //                                           si j'ai emprunté, c'est moi qui rends (j_ai_rendu)
      events.push({
        date: doc.returnedAt,
        type: effectiveKind === 'loan' ? 'they_returned' : 'i_returned',
        what: doc.what,
        loanId: doc._id,
      });
    }
  }

  events.sort((a, b) => new Date(b.date) - new Date(a.date));

  return res.status(200).json({
    data: { friendDisplayName, events },
    error: null,
    message: null,
  });
}

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
