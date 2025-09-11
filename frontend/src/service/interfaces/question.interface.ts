import type { CRISP } from "../enums/crisp.enum";
import type { Difficulty } from "../enums/difficulty.enum";

export interface addQuestionDto {
  crispCategory: CRISP;

  questionText: string;

  options: string[];

  correctAnswer: number;

  difficultyLevel?: Difficulty;

  roles?: number[];
}
