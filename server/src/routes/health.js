import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.json({
    data: {
      status: 'ok',
      db: dbStatus,
      uptime: process.uptime(),
    },
    error: null,
    message: 'Server is healthy',
  });
});

export default router;
