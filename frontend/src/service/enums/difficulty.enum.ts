export const Difficulty = {
  BEGINNER: "beginner",
  INTERMIDIATE: "INTEMIDIATE",
  ADVANCED: "advanced",
} as const;

export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];
