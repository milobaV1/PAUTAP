//import type { Difficulty } from "../enums/difficulty.enum";

export interface Role {
  id: string;
  name: string;
  department?: Department;
}

export interface Department {
  id: string;
  name: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_onboarding: boolean;
  created_at: string;
  updated_at: string;
  role: Role;
  certificates?: any[];
}

export interface LoginInterface {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}
export interface DashboardResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  completedSessions: number;
  triviaScore: number;
  certificatesCount: number;
  // incompleteSessions: IncompleteSession[];
}

export interface UserWithStats {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  createdAt: Date;
  role: string;
  department: string;
  totalCertificates: number;
}

export interface AdminStatsUserResponse {
  totalUsers: number;
  totalCertificates: number;
  users: UserWithStats[];
  page: number;
  limit: number;
}

export interface CreateUser {
  first_name: string;
  last_name: string;
  email: string;
  is_onboarding?: boolean;
  // password: string;
  role_id: number;
}

export interface VerifyPasswordDto {
  password: string;
}

export interface UpdatePasswordDto {
  newPassword: string;
}
