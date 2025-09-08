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
