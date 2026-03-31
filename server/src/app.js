import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import loansRouter from './routes/loans.js';
import userRouter from './routes/user.js';
import friendsRouter from './routes/friends.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

app.use(cors());
app.use(express.json());

app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/loans', loansRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/friends', friendsRouter);

// Serve SvelteKit static build
const clientBuild = join(__dirname, '../../client/build');
app.use(express.static(clientBuild));
app.get('*', (_req, res) => {
  res.sendFile(join(clientBuild, '200.html'));
});

const start = async () => {
  await mongoose.connect(MONGO_URL);
  console.log('MongoDB connected');

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
