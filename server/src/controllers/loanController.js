import Loan from '../models/Loan.js';

export async function createLoan(req, res) {
  const { what, to } = req.body;

  if (!what?.trim() || !to?.trim()) {
    return res.status(400).json({ data: null, error: 'MISSING_FIELDS', message: 'Veuillez renseigner quoi et à qui.' });
  }

  const loan = await Loan.create({ lender: req.user.userId, what: what.trim(), to: to.trim() });

  return res.status(201).json({ data: loan, error: null, message: 'Prêt enregistré.' });
}

export async function getLoans(req, res) {
  const loans = await Loan.find({ lender: req.user.userId }).sort({ createdAt: -1 });

  return res.status(200).json({ data: loans, error: null, message: null });
}

export async function returnLoan(req, res) {
  const loan = await Loan.findOne({ _id: req.params.id, lender: req.user.userId });

  if (!loan) {
    return res.status(404).json({ data: null, error: 'NOT_FOUND', message: 'Prêt introuvable.' });
  }

  if (loan.returnedAt) {
    return res.status(409).json({ data: null, error: 'ALREADY_RETURNED', message: 'Ce prêt est déjà marqué comme rendu.' });
  }

  loan.returnedAt = new Date();
  await loan.save();

  return res.status(200).json({ data: loan, error: null, message: 'Prêt marqué comme rendu.' });
}
