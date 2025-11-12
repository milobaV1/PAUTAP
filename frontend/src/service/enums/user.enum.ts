export const UserLevel = {
  HEAD_OF_DEPT: "head_of_dept",
  NORMAL: "normal",
};

export type UserLevel = (typeof UserLevel)[keyof typeof UserLevel];
