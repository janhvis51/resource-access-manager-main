
export type UserRole = 'Employee' | 'Manager' | 'Admin';

export type AccessLevel = 'Read' | 'Write' | 'Admin';

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface User {
  id: number;
  username: string;
  role: UserRole;
}

export interface Software {
  id: number;
  name: string;
  description: string;
  accessLevels: AccessLevel[];
}

export interface AccessRequest {
  id: number;
  userId: number;
  user?: User;
  softwareId: number;
  software?: Software;
  accessType: AccessLevel;
  reason: string;
  status: RequestStatus;
  createdAt: string;
}
