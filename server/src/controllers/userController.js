import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Loan from '../models/Loan.js';

export async function searchUsers(req, res) {
  const q = req.query.q?.trim();
  if (!q || q.length < 2) {
    return res.status(200).json({ data: [], error: null, message: null });
  }

  const regex = new RegExp(q, 'i');
  const users = await User.find(
    {
      _id: { $ne: req.user.userId },
      isVerified: true,
      $or: [{ email: regex }, { username: regex }],
    },
    'email username'
  ).limit(8);

  return res.status(200).json({
    data: users.map((u) => ({ email: u.email, username: u.username || null, display: u.username || u.email })),
    error: null,
    message: null,
  });
}

export async function getMe(req, res) {
  const user = await User.findById(req.user.userId, 'email username');

  if (!user) {
    return res.status(404).json({ data: null, error: 'NOT_FOUND', message: 'Utilisateur introuvable.' });
  }

  return res.status(200).json({
    data: { email: user.email, username: user.username || user.email },
    error: null,
    message: null,
  });
}

export async function updateUsername(req, res) {
  const { username } = req.body;

  if (!username?.trim()) {
    return res.status(400).json({ data: null, error: 'MISSING_FIELDS', message: 'Le pseudo ne peut pas être vide.' });
  }

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { username: username.trim() },
    { new: true, select: 'email username' }
  );

  return res.status(200).json({
    data: { email: user.email, username: user.username },
    error: null,
    message: 'Pseudo mis à jour.',
  });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ data: null, error: 'MISSING_FIELDS', message: 'Mot de passe actuel et nouveau mot de passe requis.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ data: null, error: 'PASSWORD_TOO_SHORT', message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' });
  }

  const user = await User.findById(req.user.userId);
  const match = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!match) {
    return res.status(401).json({ data: null, error: 'WRONG_PASSWORD', message: 'Mot de passe actuel incorrect.' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();

  return res.status(200).json({ data: null, error: null, message: 'Mot de passe mis à jour.' });
}

export async function deleteAccount(req, res) {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ data: null, error: 'MISSING_FIELDS', message: 'Mot de passe requis pour confirmer la suppression.' });
  }

  const user = await User.findById(req.user.userId);
  const match = await bcrypt.compare(password, user.passwordHash);

  if (!match) {
    return res.status(401).json({ data: null, error: 'WRONG_PASSWORD', message: 'Mot de passe incorrect.' });
  }

  await Loan.deleteMany({ owner: req.user.userId });
  await user.deleteOne();

  return res.status(200).json({ data: null, error: null, message: 'Compte supprimé.' });
}
