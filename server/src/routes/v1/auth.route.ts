import { Router } from 'express';
import { register, login, refresh, logout, me, debugCheck } from '../../controllers/auth.controller';
import { validateBody } from '../../validators/zod';
import { z } from 'zod';
import { protect } from '../../middlewares/auth';

const router = Router();

const registerSchema = z.object({ name: z.string().min(1), email: z.string().email(), password: z.string().min(8) });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const debugSchema = z.object({ email: z.string().email(), password: z.string().min(0) });

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
// Dev-only debug route
router.post('/debug-check', validateBody(debugSchema), debugCheck);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, me);

export default router;
