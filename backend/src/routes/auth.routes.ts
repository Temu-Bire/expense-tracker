import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  getMe,
} from '../controllers/auth.controller';
import { validateRequest, authenticateToken } from '../middleware';
import {
  registerUserSchema,
  loginUserSchema,
  refreshTokenSchema,
  logoutSchema,
} from '../validators/user.validator';

const router = Router();

// Public auth endpoints
router.post(
  '/register',
  validateRequest({ body: registerUserSchema }),
  register
);

router.post(
  '/login',
  validateRequest({ body: loginUserSchema }),
  login
);

router.post(
  '/refresh',
  validateRequest({ body: refreshTokenSchema }),
  refresh
);

router.post(
  '/logout',
  validateRequest({ body: logoutSchema }),
  logout
);

// Protected current-user endpoint
router.get('/me', authenticateToken, getMe);

export default router;
