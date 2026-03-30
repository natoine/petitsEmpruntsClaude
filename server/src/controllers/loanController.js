import Loan from '../models/Loan.js';
import User from '../models/User.js';
import { sendLoanNotification, sendLoanInvitation } from '../services/email.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createLoan(req, res) {
  const { kind, what, counterpart } = req.body;

  if (!['loan', 'borrow'].includes(kind)) {
    return res.status(400).json({ data: null, error: 'INVALID_KIND', message: 'Le type doit être "loan" ou "borrow".' });
  }

  if (!what?.trim() || !counterpart?.trim()) {
    return res.status(400).json({ data: null, error: 'MISSING_FIELDS', message: 'Veuillez renseigner quoi et à qui.' });
  }

  const owner = await User.findById(req.user.userId, 'email username');
  const ownerName = owner.username || owner.email;

  const rawCounterpart = counterpart.trim();
  let displayName = rawCounterpart;
  let counterpartUserId = null;
  let counterpartEmail = null;

  if (EMAIL_RE.test(rawCounterpart)) {
    counterpartEmail = rawCounterpart.toLowerCase();
    const match = await User.findOne({ email: counterpartEmail, isVerified: true }, 'email username');

    if (match) {
      counterpartUserId = match._id;
      displayName = match.username || match.email;
      sendLoanNotification({ to: match.email, ownerName, kind, what: what.trim() }).catch(console.error);
    } else {
      sendLoanInvitation({ to: counterpartEmail, ownerName, kind, what: what.trim() }).catch(console.error);
    }
  }

  const entry = await Loan.create({
    owner: req.user.userId,
    kind,
    what: what.trim(),
    counterpart: displayName,
    counterpartUserId,
    counterpartEmail,
  });

  return res.status(201).json({ data: entry, error: null, message: 'Enregistré.' });
}

export async function getLoans(req, res) {
  const userId = req.user.userId;

  // Entrées dont l'utilisateur est l'auteur
  const ownEntries = await Loan.find({ owner: userId })
    .populate('owner', 'email username')
    .populate('counterpartUserId', 'email username')
    .sort({ createdAt: -1 });

  // Entrées dont l'utilisateur est la contrepartie (par userId ou par email)
  const currentUser = await User.findById(userId, 'email');
  const reciprocalEntries = await Loan.find({
    owner: { $ne: userId },
    $or: [{ counterpartUserId: userId }, { counterpartEmail: currentUser.email }],
  })
    .populate('owner', 'email username')
    .sort({ createdAt: -1 });

  // Résoudre les noms des contreparties identifiées par email sans userId (vieux prêts)
  const unmatchedEmails = ownEntries
    .filter((e) => !e.counterpartUserId && e.counterpartEmail)
    .map((e) => e.counterpartEmail);

  const usersByEmail = unmatchedEmails.length
    ? await User.find({ email: { $in: unmatchedEmails }, isVerified: true }, 'email username')
    : [];
  const emailToUser = Object.fromEntries(usersByEmail.map((u) => [u.email, u]));

  const format = (entry, asReciprocal) => {
    const doc = entry.toObject();
    if (!asReciprocal) {
      if (entry.counterpartUserId) {
        doc.counterpart = entry.counterpartUserId.username || entry.counterpartUserId.email;
      } else if (entry.counterpartEmail && emailToUser[entry.counterpartEmail]) {
        doc.counterpart = emailToUser[entry.counterpartEmail].username || entry.counterpartEmail;
      }
      return doc;
    }

    // Du point de vue de la contrepartie, on inverse le kind et la personne affichée
    const ownerUser = entry.owner;
    return {
      ...doc,
      kind: doc.kind === 'loan' ? 'borrow' : 'loan',
      counterpart: ownerUser.username || ownerUser.email,
      _reciprocal: true,
    };
  };

  const all = [
    ...ownEntries.map((e) => format(e, false)),
    ...reciprocalEntries.map((e) => format(e, true)),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res.status(200).json({ data: all, error: null, message: null });
}

export async function returnLoan(req, res) {
  const userId = req.user.userId;

  // Autorise aussi bien l'auteur que la contrepartie à marquer comme terminé
  const entry = await Loan.findOne({
    _id: req.params.id,
    $or: [{ owner: userId }, { counterpartUserId: userId }],
  });

  if (!entry) {
    return res.status(404).json({ data: null, error: 'NOT_FOUND', message: 'Entrée introuvable.' });
  }

  if (entry.returnedAt) {
    return res.status(409).json({ data: null, error: 'ALREADY_RETURNED', message: 'Déjà marqué comme terminé.' });
  }

  entry.returnedAt = new Date();
  await entry.save();

  const isReciprocal = entry.owner.toString() !== userId.toString();

  if (isReciprocal) {
    const ownerUser = await User.findById(entry.owner, 'email username');
    return res.status(200).json({
      data: {
        ...entry.toObject(),
        kind: entry.kind === 'loan' ? 'borrow' : 'loan',
        counterpart: ownerUser.username || ownerUser.email,
        _reciprocal: true,
      },
      error: null,
      message: 'Marqué comme terminé.',
    });
  }

  // Résoudre le nom de la contrepartie depuis son profil courant
  if (entry.counterpartUserId) {
    const cpUser = await User.findById(entry.counterpartUserId, 'email username');
    const doc = entry.toObject();
    doc.counterpart = cpUser.username || cpUser.email;
    return res.status(200).json({ data: doc, error: null, message: 'Marqué comme terminé.' });
  }

  return res.status(200).json({ data: entry, error: null, message: 'Marqué comme terminé.' });
}
