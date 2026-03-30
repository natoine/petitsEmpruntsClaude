import Loan from '../models/Loan.js';

export async function createLoan(req, res) {
  const { kind, what, counterpart } = req.body;

  if (!['loan', 'borrow'].includes(kind)) {
    return res.status(400).json({ data: null, error: 'INVALID_KIND', message: 'Le type doit être "loan" ou "borrow".' });
  }

  if (!what?.trim() || !counterpart?.trim()) {
    return res.status(400).json({ data: null, error: 'MISSING_FIELDS', message: 'Veuillez renseigner quoi et à qui.' });
  }

  const entry = await Loan.create({
    owner: req.user.userId,
    kind,
    what: what.trim(),
    counterpart: counterpart.trim(),
  });

  return res.status(201).json({ data: entry, error: null, message: 'Enregistré.' });
}

export async function getLoans(req, res) {
  const entries = await Loan.find({ owner: req.user.userId }).sort({ createdAt: -1 });

  return res.status(200).json({ data: entries, error: null, message: null });
}

export async function returnLoan(req, res) {
  const entry = await Loan.findOne({ _id: req.params.id, owner: req.user.userId });

  if (!entry) {
    return res.status(404).json({ data: null, error: 'NOT_FOUND', message: 'Entrée introuvable.' });
  }

  if (entry.returnedAt) {
    return res.status(409).json({ data: null, error: 'ALREADY_RETURNED', message: 'Déjà marqué comme terminé.' });
  }

  entry.returnedAt = new Date();
  await entry.save();

  return res.status(200).json({ data: entry, error: null, message: 'Marqué comme terminé.' });
}
