import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { LoginCredentials, RegisterCredentials } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  private authService = new AuthService();

  // POST /api/auth/signup
  signup = asyncHandler(async (req: Request, res: Response) => {
    const credentials: RegisterCredentials = req.body;
    const result = await this.authService.register(credentials);

    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      token: result.token
    });
  });

  // POST /api/auth/login
  login = asyncHandler(async (req: Request, res: Response) => {
    const credentials: LoginCredentials = req.body;
    const result = await this.authService.login(credentials);

    res.status(200).json({
      message: 'Login successful',
      user: result.user,
      token: result.token
    });
  });

  // GET /api/auth/profile
  getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await this.authService.validateUser(req.user!.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { passwordHash, ...userWithoutPassword } = user;
    
    res.status(200).json({
      user: userWithoutPassword
    });
  });

  // POST /api/auth/change-password
  changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Old password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'New password must be at least 6 characters long' 
      });
    }

    await this.authService.changePassword(req.user!.userId, oldPassword, newPassword);

    res.status(200).json({
      message: 'Password changed successfully'
    });
  });

  // POST /api/auth/refresh
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const newToken = await this.authService.refreshToken(token);

    res.status(200).json({
      message: 'Token refreshed successfully',
      token: newToken
    });
  });

  // POST /api/auth/logout
  logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Since we're using stateless JWT, logout is handled client-side
    // But we can log the action for audit purposes
    res.status(200).json({
      message: 'Logged out successfully'
    });
  });
}