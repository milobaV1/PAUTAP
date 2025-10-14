// import { Difficulty } from '../enums/question.enum';

export interface UserQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  role_id?: number;
  department_id?: number;
  //level?: Difficulty;
  is_onboarding?: boolean;
  include_relations?: boolean;
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

// export interface IncompleteSession {
//   sessionId: string;
//   sessionTitle: string;
//   status: string; // or ProgressStatus if you want to import the enum
//   progress: {
//     answered: number;
//     total: number;
//     percentage: number;
//   };
// }

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
  //totalActiveUsers: number;
  totalCertificates: number;
  totalSessionsAttempted: number;
  averageSessionScore: number;
  users: UserWithStats[];
  page: number;
  limit: number;
}
