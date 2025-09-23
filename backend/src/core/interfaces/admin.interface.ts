export interface AdminDashboardStats {
  totalUsers: number;
  totalSessions: number;
  totalCertificatesIssued: number;
  overallCompletionRate: number;
  sessions: SessionStats[];
  page: number;
  limit: number;
}

export interface SessionStats {
  id: string;
  title: string;
  description: string;
  completionRate: number;
  totalEnrolled: number;
  totalCompleted: number;
}
