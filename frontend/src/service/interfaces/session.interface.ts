import type { CRISP } from "../enums/crisp.enum";

import type { Difficulty } from "../enums/difficulty.enum";
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
  crispCategory: CRISP;
  questionText: string;
  options: string[];
  correctAnswer: number;
  difficultyLevel: Difficulty;
  createdAt: string;
}

export interface Category {
  categoryId: number;
  category: CRISP;
  questionsCount: number;
  questionIds: string[];
  questions: Question[];
  userAnswers: UserAnswer[];
}

export interface UsersessionData {
  sessionId: string;
  sessionTitle: string;
  sessionDescription: string;
  sessionDifficulty: Difficulty;
  sessionCreatedAt: string;
  questionsGenerated: boolean;

  // Progress data
  status: "not_started" | "in_progress" | "completed" | string; // could refine to ProgressStatus enum
  currentCategory: CRISP | null;
  progressPercentage: number;
  accuracyPercentage: number;
  totalQuestions: number;
  answeredQuestions: number;
  correctlyAnsweredQuestions: number;

  // Timestamps
  startedAt: string | null;
  lastActiveAt: string | null;
  completedAt: string | null;

  // Categories with questions
  categories: Category[];
  totalQuestionsAvailable: number;

  // Helper flags
  isStarted: boolean;
  isCompleted: boolean;
  canStart: boolean;
}

export interface SessionCompletionResult {
  success: boolean;
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
