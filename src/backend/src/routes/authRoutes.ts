import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validateDto } from '../middleware/validation';
import { LoginDto, RegisterDto, ChangePasswordDto } from '../dto';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/signup', validateDto(RegisterDto), authController.signup);
router.post('/login', validateDto(LoginDto), authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/change-password', 
  authenticateToken, 
  validateDto(ChangePasswordDto), 
  authController.changePassword
);
router.post('/logout', authenticateToken, authController.logout);

export default router;