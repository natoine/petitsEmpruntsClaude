import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createLoan, getLoans } from '../controllers/loanController.js';

const router = Router();

router.use(requireAuth);

router.get('/', getLoans);
router.post('/', createLoan);

export default router;
