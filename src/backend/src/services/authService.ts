import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { UserRole, JwtPayload, LoginCredentials, RegisterCredentials } from '../types';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async register(credentials: RegisterCredentials): Promise<{ user: Omit<User, 'passwordHash'>, token: string }> {
    const { username, password, role } = credentials;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new AppError('Username already exists', 409);
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      throw new AppError('Invalid role specified', 400);
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      username,
      passwordHash,
      role
    });

    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const token = this.generateToken(savedUser);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword,
      token
    };
  }

  async login(credentials: LoginCredentials): Promise<{ user: Omit<User, 'passwordHash'>, token: string }> {
    const { username, password } = credentials;

    // Find user by username
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  async validateUser(userId: number): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      return user;
    } catch (error) {
      return null;
    }
  }

  private generateToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      role: user.role
    };

    return jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isOldPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await this.userRepository.update(userId, { passwordHash: newPasswordHash });
  }

  async refreshToken(oldToken: string): Promise<string> {
    try {
      const decoded = jwt.verify(oldToken, process.env.JWT_SECRET!) as JwtPayload;
      const user = await this.validateUser(decoded.userId);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      return this.generateToken(user);
    } catch (error) {
      throw new AppError('Invalid token', 401);
    }
  }
}