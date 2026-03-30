import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getFriends, getFriendHistory } from '../controllers/friendsController.js';

const router = Router();

router.use(requireAuth);
router.get('/', getFriends);
router.get('/history', getFriendHistory);

export default router;
