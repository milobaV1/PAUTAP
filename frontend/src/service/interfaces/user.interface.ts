//import type { Difficulty } from "../enums/difficulty.enum";

import type { UserLevel } from "../enums/user.enum";

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
  level: UserLevel;
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

// export interface UserWithStats {
//   id: string;
//   first_name: string;
//   last_name: string;
//   email: string;
//   createdAt: Date;
//   role: string;
//   department: string;
//   totalCertificates: number;
// }

// export interface AdminStatsUserResponse {
//   totalUsers: number;
//   totalCertificates: number;
//   users: UserWithStats[];
//   page: number;
//   limit: number;
// }

export interface SessionStats {
  totalAttempts: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  averageScore: string | number;
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
  sessionStats: SessionStats;
}

export interface AdminStatsUserResponse {
  totalUsers: number;
  totalCertificates: number;
  totalSessionsAttempted: number; // Global stat
  averageSessionScore: number; // Global stat - now a number
  users: UserWithStats[];
  page: number;
  limit: number;
}

export interface HODStatsUserResponse {
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
  level: UserLevel;
  // password: string;
  role_id: number;
}

export interface VerifyPasswordDto {
  password: string;
}

export interface UpdatePasswordDto {
  newPassword: string;
}

export interface GetUserDetailsParams {
  sessionsPage?: number;
  certificatesPage?: number;
  sessionsStartDate?: string;
  sessionsEndDate?: string;
  certificatesStartDate?: string;
  certificatesEndDate?: string;
}

export interface UserData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    level: string;
    isOnboarding: boolean;
    role: {
      id: number;
      name: string;
      department: {
        id: number;
        name: string;
      } | null;
    } | null;
    createdAt: string;
    updatedAt: string;
  };
  sessions: Array<{
    sessionId: string;
    sessionTitle: string;
    sessionDescription: string | null;
    timeLimit: number;
    questionsPerCategory: number;
    isOnboardingSession: boolean;
    sessionCreatedAt: string;
    hasProgress: boolean;
    progress: {
      status: string;
      currentCategory: string;
      currentQuestionIndex: number;
      totalQuestions: number;
      answeredQuestions: number;
      correctlyAnsweredQuestions: number;
      overallScore: number;
      categoryScores: Record<string, number>;
      progressPercentage: number;
      accuracyPercentage: number;
      startedAt: string | null;
      lastActiveAt: string | null;
      completedAt: string | null;
    } | null;
  }>;
  certificates: Array<{
    id: string;
    certificateId: string;
    sessionId: string | null;
    sessionTitle: string | null;
    filePath: string;
    source: string;
    score: number | null;
    title: string | null;
    issuedBy: string | null;
    issuedDate: string | null;
    validUntil: string | null;
    createdAt: string;
  }>;
  statistics: {
    totalAvailableSessions: number;
    totalSessionsEnrolled: number;
    completedSessions: number;
    inProgressSessions: number;
    notStartedSessions: number;
    totalCertificates: number;
    averageScore: number;
    overallAccuracy: number;
  };
  pagination: {
    sessions: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
    certificates: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}
