export interface CurrentTriviaResponse {
  trivia?: {
    id: string;
    title: string;
    description?: string;
    totalQuestions: number;
    timeLimit: number;
    status: "scheduled" | "active" | "expired" | "cancelled";
    scheduledAt: string;
    startedAt?: string;
    endedAt?: string;
  };
  userParticipation?: {
    id: string;
    triviaId: string;
    userId: string;
    status:
      | "not_started"
      | "in_progress"
      | "completed"
      | "submitted"
      | "expired";
    score: number;
    correctAnswers: number;
    totalAnswered: number;
    timeSpent?: number;
    startedAt?: string;
    completedAt?: string;
    submittedAt?: string;
  };
  canParticipate: boolean;
  message?: string;
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  category: string;
  difficulty: string;
}

export interface StartTriviaResponse {
  participation: {
    id: string;
    triviaId: string;
    userId: string;
    status: string;
    startedAt: string;
  };
  questions: TriviaQuestion[];
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  month: number;
  year: number;
  triviaCount: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  totalCorrectAnswers: number;
  totalQuestionsAnswered: number;
  overallAccuracy: number;
  rank: number;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: {
      name: string;
      department: {
        name: string;
      };
    };
  };
}
