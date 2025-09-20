import { useAuthState } from "@/store/auth.store";

// In your auth-extension.ts
export const isUser = () => {
  const state = useAuthState.getState();
  console.log("isUser check:", state);
  return !!state.user; // or however you check
};

export const isAdmin = () => {
  const state = useAuthState.getState();
  console.log("isAdmin check:", state);
  // Your admin check logic here
  return state.decodedDto && state.decodedDto.sub.roleId === 1;
};
