import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { IsNotEmpty, IsArray } from 'class-validator';
import { AccessLevel } from '../types';
import { AccessRequest } from './AccessRequest';

@Entity('software')
export class Software {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column('text')
  @IsNotEmpty()
  description: string;

  @Column('simple-array')
  @IsArray()
  accessLevels: AccessLevel[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => AccessRequest, request => request.software)
  requests: AccessRequest[];

  // Helper method to check if access level is supported
  supportsAccessLevel(accessType: AccessLevel): boolean {
    return this.accessLevels.includes(accessType);
  }
}