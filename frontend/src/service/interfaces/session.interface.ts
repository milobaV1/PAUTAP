import type { CRISP } from "../enums/crisp.enum";

//import type { Difficulty } from "../enums/difficulty.enum";
export interface CategoryProgress {
  categoryProgress?: {
    [key: string]: {
      completed: boolean;
      score: number;
      timeSpent: number;
      passed: boolean;
    };
  };
}

export interface getSessions {
  userId: string | undefined;
  userRoleId: number | undefined;
}

export interface Answer {
  questionId: string;
  userAnswer: number;
  answeredAt: Date;
  category: string;
}

export interface ProgressSummary {
  currentCategory: CRISP | undefined;
  currentQuestionIndex: number;
  totalAnswered: number;
  totalCorrect: number;
  progressPercentage: number;
  status: "not_started" | "in_progress" | "completed" | string;
}

export interface UserAnswer {
  id: string;
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  createdAt: string;
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  crispCategory: CRISP;
  //difficultyLevel: Difficulty;
}

export interface Category {
  categoryId: number;
  category: CRISP;
  questionsCount: number;
  questionIds: string[];
  questions: Question[];
  userAnswers: UserAnswer[];
}

// export interface UsersessionData {
//   sessionId: string;
//   sessionTitle: string;
//   sessionDescription: string;
//   //sessionDifficulty: Difficulty;
//   sessionCreatedAt: string;
//   questionsGenerated: boolean;

//   // Progress data
//   status: "not_started" | "in_progress" | "completed" | string; // could refine to ProgressStatus enum
//   currentCategory: CRISP | null;
//   progressPercentage: number;
//   accuracyPercentage: number;
//   totalQuestions: number;
//   answeredQuestions: number;
//   correctlyAnsweredQuestions: number;

//   // Timestamps
//   startedAt: string | null;
//   lastActiveAt: string | null;
//   completedAt: string | null;

//   // Categories with questions
//   categories: Category[];
//   totalQuestionsAvailable: number;

//   // Helper flags
//   isStarted: boolean;
//   isCompleted: boolean;
//   canStart: boolean;
// }

export interface SessionCompletionResult {
  success: boolean;
  sessionTitle: string;
  finalScore: number;
  categoryScores: Record<string, number>;
  certificateId: string;
  completionTime: number;
  rank: number;
}

export interface CompleteSessionPayload {
  userId: string;
}

// export interface

// status: "not_started" | "in_progress" | "completed" | string; // could refine to ProgressStatus enum
// currentCategory: CRISP | null;
// progressPercentage: number;
// accuracyPercentage: number;
// totalQuestions: number;
// answeredQuestions: number;
// correctlyAnsweredQuestions: number;

// export type UserSessionStatus = {
//   sessionId: string; // UUID
//   sessionTitle: string;
//   sessionDescription: string;
//   sessionDifficulty: "beginner" | "intermediate" | "advanced";
//   sessionCreatedAt: string; // ISO date string
//   questionsGenerated: boolean;
//   totalQuestionsAvailable: number;
//   status: "not_started" | "in_progress" | "completed" | string; // adjust as per your ProgressStatus enum
//   currentCategory: string | null;
//   progressPercentage: number;
//   accuracyPercentage: number;
//   totalQuestions: number;
//   answeredQuestions: number;
//   correctlyAnsweredQuestions: number;
//   startedAt: string | null; // ISO date string
//   lastActiveAt: string | null; // ISO date string
//   completedAt: string | null; // ISO date string
//   isStarted: boolean;
//   isCompleted: boolean;
//   canStart: boolean;
// };

export interface SessionSummary {
  sessionId: string;
  sessionTitle: string;
  sessionDescription: string;
  //sessionDifficulty: Difficulty;
  sessionCreatedAt: string;
  questionsGenerated: boolean;

  // Minimal progress data
  status: "not_started" | "in_progress" | "completed" | string;
  progressPercentage: number;
  accuracyPercentage?: number;

  // Timestamps
  startedAt: string | null;
  lastActiveAt: string | null;
  completedAt: string | null;

  // Helper flags
  isStarted: boolean;
  isCompleted: boolean;
  canStart: boolean;

  // Counts only - NO actual question data
  totalQuestionsAvailable: number;
  answeredQuestions?: number;
  correctlyAnsweredQuestions?: number;
}

// NEW: Full session data from startOrResumeSession
export interface FullSessionData {
  session: {
    id: string;
    title: string;
    description: string;
    //difficulty: Difficulty;
    timeLimit: number;
    questionsGenerated: boolean;
    isActive: boolean;
    createdAt: string;
  };
  progress: {
    status: "not_started" | "in_progress" | "completed" | string;
    currentCategory: CRISP | null;
    currentQuestionIndex: number;
    totalQuestions: number;
    answeredQuestions: number;
    correctlyAnsweredQuestions: number;
    progressPercentage: number;
    accuracyPercentage: number;
    startedAt: string | null;
    lastActiveAt: string | null;
    completedAt: string | null;
  };
  // questionsByCategory: Array<{
  //   categoryId: string;
  //   category: CRISP;
  //   questions: Array<{
  //     id: string;
  //     text: string;
  //     options: string[];
  //     order: number;
  //     isAnswered: boolean;
  //   }>;
  //   totalQuestions: number;
  //   answeredCount: number;
  // }>;
  categories: Category[];
  syncInterval: number;
  autoSyncTriggers: string[];
}

export interface RetakeSessionDto {
  sessionId: string;
  userId: string;
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

export interface CreateSessionDto {
  title: string;

  description?: string;

  timeLimit?: number;
}

export interface SessionRoleCategoryQuestion {
  id: number;
  sessionId: string;
  roleId: number;
  crispCategory: CRISP;
  questionIds: string[]; // stores IDs of questions
  questionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  questionsGenerated: boolean;
  timeLimit: number; // in seconds
  createdAt: string;
  updatedAt: string;
  roleCategoryQuestions?: SessionRoleCategoryQuestion[];
}
