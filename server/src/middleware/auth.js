import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ data: null, error: 'UNAUTHORIZED', message: 'Token manquant.' });
  }

  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ data: null, error: 'INVALID_TOKEN', message: 'Token invalide ou expiré.' });
  }
}
