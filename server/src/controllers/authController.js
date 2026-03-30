import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Loan from '../models/Loan.js';
import { sendVerificationEmail } from '../services/email.js';

export async function register(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ data: null, error: 'MISSING_FIELDS', message: 'Email et mot de passe requis.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ data: null, error: 'PASSWORD_TOO_SHORT', message: 'Le mot de passe doit contenir au moins 8 caractères.' });
  }

  const existing = await User.findOne({ email });
  if (existing && existing.isVerified) {
    return res.status(409).json({ data: null, error: 'EMAIL_TAKEN', message: 'Un compte existe déjà avec cet email.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  if (existing && !existing.isVerified) {
    // Resend verification to unverified account
    existing.passwordHash = passwordHash;
    existing.verificationToken = verificationToken;
    existing.verificationTokenExpiresAt = verificationTokenExpiresAt;
    await existing.save();
  } else {
    await User.create({ email, passwordHash, verificationToken, verificationTokenExpiresAt });
  }

  await sendVerificationEmail(email, verificationToken);

  return res.status(201).json({
    data: null,
    error: null,
    message: 'Compte créé. Vérifiez votre email pour activer votre compte.',
  });
}

export async function verifyEmail(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ data: null, error: 'MISSING_TOKEN', message: 'Token manquant.' });
  }

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpiresAt: { $gt: new Date() },
    isVerified: false,
  });

  if (!user) {
    return res.status(400).json({ data: null, error: 'INVALID_TOKEN', message: 'Lien invalide ou expiré.' });
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiresAt = null;
  await user.save();

  // Rattacher rétroactivement les prêts/emprunts qui ciblaient cet email
  await Loan.updateMany(
    { 'lender.email': user.email, 'lender.userId': null },
    { $set: { 'lender.userId': user._id } }
  );
  await Loan.updateMany(
    { 'borrower.email': user.email, 'borrower.userId': null },
    { $set: { 'borrower.userId': user._id } }
  );

  return res.status(200).json({
    data: null,
    error: null,
    message: 'Email confirmé ! Vous pouvez maintenant vous connecter.',
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ data: null, error: 'MISSING_FIELDS', message: 'Email et mot de passe requis.' });
  }

  const user = await User.findOne({ email });
  const passwordMatch = user && await bcrypt.compare(password, user.passwordHash);

  if (!user || !passwordMatch) {
    return res.status(401).json({ data: null, error: 'INVALID_CREDENTIALS', message: 'Email ou mot de passe incorrect.' });
  }

  if (!user.isVerified) {
    return res.status(403).json({ data: null, error: 'EMAIL_NOT_VERIFIED', message: 'Veuillez confirmer votre email avant de vous connecter.' });
  }

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.status(200).json({
    data: { token, email: user.email },
    error: null,
    message: 'Connexion réussie.',
  });
}
