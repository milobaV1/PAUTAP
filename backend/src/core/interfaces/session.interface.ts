import { CRISP } from '../enums/training.enum';
import { ProgressStatus } from '../enums/user.enum';

export interface CompletionMetrics {
  overallScore: number;
  categoryScores: Record<string, number>;
  timeSpent: number;
  //roleRank: number;
  finalScores: any;
}

export interface SessionCompletionResult {
  success: boolean;
  sessionTitle: string;
  finalScore: number;
  categoryScores: Record<string, number>;
  certificateId: string;
  completionTime: number;
  //rank: number;
}

// Interfaces
export interface AnswerBatch {
  questionId: string;
  userAnswer: number;
  answeredAt: Date;
  category: string;
}

export interface ProgressState {
  currentCategory: CRISP | undefined;
  currentQuestionIndex: number;
  status?: ProgressStatus;
}

export interface ValidatedAnswer {
  userId: string;
  questionId: string;
  sessionRoleCategoryQuestionId: number;
  userAnswer: number;
  isCorrect: boolean;
  answeredAt: Date;
  isUpdated?: boolean;
}

export interface SyncResult {
  success: boolean;
  syncedAnswers: number;
  currentProgress: ProgressSummary;
  nextSyncRecommended: number;
  statusUpdated?: boolean; // Add this
  newStatus?: string;
}

export interface ProgressSummary {
  currentCategory: CRISP | undefined;
  currentQuestionIndex: number;
  totalAnswered: number;
  totalCorrect: number;
  progressPercentage: number;
  status: string;
  completedAt?: Date; // Add this
  isComplete?: boolean; // Add this for convenience
}

export interface AdminSessionSummary {
  id: string;
  title: string;
  description: string | null;
  totalQuestions: number;
  createdAt: Date;
}

export interface AdminSessionsResponse {
  totalSessions: number;
  totalQuestions: number;
  sessions: AdminSessionSummary[];
  page: number;
  limit: number;
}
