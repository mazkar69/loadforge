import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.middleware.js';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    updateProfileSchema,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/register', authRateLimiter, validateBody(registerSchema), authController.register);
router.post('/login', authRateLimiter, validateBody(loginSchema), authController.login);
router.post('/refresh', validateBody(refreshTokenSchema), authController.refreshToken);
router.post('/logout', requireAuth, authController.logout);
router.get('/profile', requireAuth, authController.getProfile);
router.patch('/profile', requireAuth, validateBody(updateProfileSchema), authController.updateProfile);

export default router;
