import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate';
import { registerUserSchema, loginUserSchema } from '../validators/user.validator';

const router = Router();

router.post('/register', validateRequest({ body: registerUserSchema }), register);
router.post('/login', validateRequest({ body: loginUserSchema }), login);
router.get('/me', getMe);

export default router;
