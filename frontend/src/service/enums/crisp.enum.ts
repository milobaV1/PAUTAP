export const CRISP = {
  C: "community",
  R: "respect",
  I: "integrity",
  S: "service",
  P: "professionalism",
} as const;

export type CRISP = (typeof CRISP)[keyof typeof CRISP];
