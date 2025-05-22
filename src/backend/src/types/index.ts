export enum UserRole {
  EMPLOYEE = 'Employee',
  MANAGER = 'Manager',
  ADMIN = 'Admin'
}

export enum AccessLevel {
  READ = 'Read',
  WRITE = 'Write',
  ADMIN = 'Admin'
}

export enum RequestStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  role: UserRole;
}

export interface CreateSoftwareDto {
  name: string;
  description: string;
  accessLevels: AccessLevel[];
}

export interface UpdateSoftwareDto {
  name?: string;
  description?: string;
  accessLevels?: AccessLevel[];
}

export interface CreateAccessRequestDto {
  softwareId: number;
  accessType: AccessLevel;
  reason: string;
}

export interface UpdateRequestStatusDto {
  status: RequestStatus;
}

export interface CreateAccessRequestDto {
  userId: number;
  softwareId: number;
  requestedAccessLevel: AccessLevel;
  businessJustification: string;
}

export interface UpdateAccessRequestDto {
  status?: RequestStatus;
  reviewedBy?: { id: number };
  reviewedAt?: Date;
  reviewComments?: string;
}