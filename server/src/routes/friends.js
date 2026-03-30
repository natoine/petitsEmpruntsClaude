import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getFriends } from '../controllers/friendsController.js';

const router = Router();

router.use(requireAuth);
router.get('/', getFriends);

export default router;
