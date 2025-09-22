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
