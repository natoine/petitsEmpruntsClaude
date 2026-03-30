import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getMe, updateUsername, changePassword, deleteAccount } from '../controllers/userController.js';

const router = Router();

router.use(requireAuth);

router.get('/me', getMe);
router.patch('/me/username', updateUsername);
router.patch('/me/password', changePassword);
router.delete('/me', deleteAccount);

export default router;
