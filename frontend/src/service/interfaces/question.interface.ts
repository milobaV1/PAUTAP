import type { CRISP } from "../enums/crisp.enum";
// import type { Difficulty } from "../enums/difficulty.enum";

export interface addQuestionDto {
  crispCategory: CRISP;

  questionText: string;

  options: string[];

  correctAnswer: number;

  explanation?: string;

  // difficultyLevel?: Difficulty;

  roles?: number[];
}

// src/modules_2/question-bank/dto/admin-question-response.dto.ts

export interface QuestionWithUsageDto {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  usage: number;
}

export interface AdminQuestionsResponse {
  totalQuestions: number;
  totalUsage: number;
  questions: QuestionWithUsageDto[];
  page: number;
  limit: number;
}
