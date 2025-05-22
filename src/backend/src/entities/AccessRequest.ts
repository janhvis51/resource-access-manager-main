import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn
} from 'typeorm';
import { IsNotEmpty, IsEnum } from 'class-validator';
import { AccessLevel, RequestStatus } from '../types';
import { User } from './User';
import { Software } from './Software';

@Entity('access_requests')
export class AccessRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.requests, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Software, software => software.requests, { eager: true })
  @JoinColumn({ name: 'softwareId' })
  software: Software;

  @Column()
  softwareId: number;

  @Column({
    type: 'enum',
    enum: AccessLevel
  })
  @IsEnum(AccessLevel)
  accessType: AccessLevel;

  @Column('text')
  @IsNotEmpty()
  reason: string;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING
  })
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isPending(): boolean {
    return this.status === RequestStatus.PENDING;
  }

  isApproved(): boolean {
    return this.status === RequestStatus.APPROVED;
  }

  isRejected(): boolean {
    return this.status === RequestStatus.REJECTED;
  }

  approve(): void {
    this.status = RequestStatus.APPROVED;
  }

  reject(): void {
    this.status = RequestStatus.REJECTED;
  }
}