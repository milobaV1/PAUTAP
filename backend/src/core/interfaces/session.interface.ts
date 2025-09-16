import { CRISP } from '../enums/training.enum';
import { ProgressStatus } from '../enums/user.enum';

export interface CompletionMetrics {
  overallScore: number;
  categoryScores: Record<string, number>;
  timeSpent: number;
  roleRank: number;
  finalScores: any;
}

export interface SessionCompletionResult {
  success: boolean;
  finalScore: number;
  categoryScores: Record<string, number>;
  certificateId: string;
  completionTime: number;
  rank: number;
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
