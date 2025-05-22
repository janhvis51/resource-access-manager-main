
// TODO: Implement with TypeORM when available
// This is a placeholder for the Software entity

/**
 * Example implementation with TypeORM:
 * 
 * import {
 *   Entity,
 *   PrimaryGeneratedColumn,
 *   Column,
 *   OneToMany
 * } from 'typeorm';
 * 
 * import { AccessRequest } from './AccessRequest.entity';
 * 
 * @Entity('software')
 * export class Software {
 *   @PrimaryGeneratedColumn()
 *   id: number;
 * 
 *   @Column()
 *   name: string;
 * 
 *   @Column('text')
 *   description: string;
 * 
 *   @Column('simple-array')
 *   accessLevels: string[];
 * 
 *   @OneToMany(() => AccessRequest, request => request.software)
 *   requests: AccessRequest[];
 * }
 */

// Placeholder export to avoid TypeScript errors
export const SoftwareEntity = {};
