import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { UserRole } from '../types';
import { AccessRequest } from './AccessRequest';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsNotEmpty()
  username: string;

  @Column()
  @IsNotEmpty()
  @MinLength(6)
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EMPLOYEE
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => AccessRequest, request => request.user)
  requests: AccessRequest[];

  // Helper method to check if user has admin or manager privileges
  hasManagerialRights(): boolean {
    return this.role === UserRole.ADMIN || this.role === UserRole.MANAGER;
  }

  // Helper method to check if user is admin
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }
}