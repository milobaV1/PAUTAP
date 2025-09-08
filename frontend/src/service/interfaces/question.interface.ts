import type { CRISP } from "../enums/crisp.enum";
import type { Difficulty } from "../enums/difficulty.enum";

export interface addQuestionDto {
  crisp_category?: CRISP;

  question_text: string;

  options: string[];

  correct_answer: number;

  difficulty_level?: Difficulty;

  role_ids?: number[];
}
