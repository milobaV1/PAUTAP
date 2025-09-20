import type { Difficulty } from "../enums/difficulty.enum";

export interface Role {
  id: string;
  name: string;
  // if your Role entity has more fields, add them here
  department?: Department;
}

export interface Department {
  id: string;
  name: string;
  // add other department fields if needed
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_onboarding: boolean;
  level: Difficulty;
  created_at: string; // Dates usually come as ISO strings from API
  updated_at: string;
  role: Role;
  // optional relationships if your API includes them
  //   question_history?: any[];
  certificates?: any[];
  //   department?: Department; // getter in entity, might be included in API
}

export interface LoginInterface {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}
