import Loan from '../models/Loan.js';
import User from '../models/User.js';
import { sendLoanNotification, sendLoanInvitation } from '../services/email.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function resolveParty(input) {
  const raw = input.trim();

  if (!EMAIL_RE.test(raw)) {
    return { userId: null, email: null, name: raw };
  }

  const email = raw.toLowerCase();
  const found = await User.findOne({ email, isVerified: true }, 'email username');

  if (found) {
    return { userId: found._id, email: found.email, name: found.username || found.email };
  }

  return { userId: null, email, name: email };
}

// Résout le nom affiché d'une partie depuis la base (au moment de la lecture)
async function resolveCurrentName(party) {
  if (!party.userId && !party.email) return party.name;
  const user = await User.findOne(
    party.userId ? { _id: party.userId } : { email: party.email, isVerified: true },
    'email username'
  );
  return user ? (user.username || user.email) : party.name;
}

// Construit la vue d'une entrée du point de vue d'un utilisateur donné.
// Utilise createdBy + kind (du créateur) pour dériver la perspective — pas de comparaison d'ObjectId fragile.
function formatForUser(doc, userId) {
  const amCreator = doc.createdBy.toString() === userId.toString();
  const effectiveKind = amCreator ? doc.kind : (doc.kind === 'loan' ? 'borrow' : 'loan');

  // Si le créateur a prêté (loan), la contrepartie est l'emprunteur, et vice-versa.
  // Du point de vue de la contrepartie, c'est l'inverse.
  const counterpart = amCreator
    ? (doc.kind === 'loan' ? doc.borrower.name : doc.lender.name)
    : (doc.kind === 'loan' ? doc.lender.name  : doc.borrower.name);

  return {
    _id: doc._id,
    what: doc.what,
    kind: effectiveKind,
    counterpart,
    returnedAt: doc.returnedAt,
    createdAt: doc.createdAt,
  };
}

export async function createLoan(req, res) {
  const { kind, what, counterpart } = req.body;

  if (!['loan', 'borrow'].includes(kind)) {
    return res.status(400).json({ data: null, error: 'INVALID_KIND', message: 'Le type doit être "loan" ou "borrow".' });
  }
  if (!what?.trim() || !counterpart?.trim()) {
    return res.status(400).json({ data: null, error: 'MISSING_FIELDS', message: 'Veuillez renseigner quoi et à qui.' });
  }

  const me = await User.findById(req.user.userId, 'email username');
  const myParty = { userId: me._id, email: me.email, name: me.username || me.email };
  const otherParty = await resolveParty(counterpart);

  const lender   = kind === 'loan'   ? myParty : otherParty;
  const borrower = kind === 'borrow' ? myParty : otherParty;

  const loan = await Loan.create({ what: what.trim(), lender, borrower, createdBy: me._id, kind });

  if (otherParty.email) {
    const ownerName = myParty.name;
    if (otherParty.userId) {
      sendLoanNotification({ to: otherParty.email, ownerName, kind, what: what.trim() }).catch(console.error);
    } else {
      sendLoanInvitation({ to: otherParty.email, ownerName, kind, what: what.trim() }).catch(console.error);
    }
  }

  return res.status(201).json({
    data: formatForUser(loan.toObject(), me._id.toString()),
    error: null,
    message: 'Enregistré.',
  });
}

export async function getLoans(req, res) {
  const userId = req.user.userId;
  const me = await User.findById(userId, 'email');

  const loans = await Loan.find({
    $or: [
      { 'lender.userId':   userId },
      { 'borrower.userId': userId },
      { 'lender.email':   me.email },
      { 'borrower.email': me.email },
    ],
  }).sort({ createdAt: -1 });

  const formatted = await Promise.all(
    loans.map(async (loan) => {
      const doc = loan.toObject();
      doc.lender.name   = await resolveCurrentName(doc.lender);
      doc.borrower.name = await resolveCurrentName(doc.borrower);
      return formatForUser(doc, userId);
    })
  );

  return res.status(200).json({ data: formatted, error: null, message: null });
}

export async function returnLoan(req, res) {
  const userId = req.user.userId;
  const me = await User.findById(userId, 'email');

  const loan = await Loan.findOne({
    _id: req.params.id,
    $or: [
      { 'lender.userId':   userId },
      { 'borrower.userId': userId },
      { 'lender.email':   me.email },
      { 'borrower.email': me.email },
    ],
  });

  if (!loan) {
    return res.status(404).json({ data: null, error: 'NOT_FOUND', message: 'Entrée introuvable.' });
  }
  if (loan.returnedAt) {
    return res.status(409).json({ data: null, error: 'ALREADY_RETURNED', message: 'Déjà marqué comme terminé.' });
  }

  loan.returnedAt = new Date();
  await loan.save();

  const doc = loan.toObject();
  doc.lender.name   = await resolveCurrentName(doc.lender);
  doc.borrower.name = await resolveCurrentName(doc.borrower);

  return res.status(200).json({
    data: formatForUser(doc, userId),
    error: null,
    message: 'Marqué comme terminé.',
  });
}
