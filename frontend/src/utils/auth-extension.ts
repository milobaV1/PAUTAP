import { UserLevel } from "@/service/enums/user.enum";
import { useAuthState } from "@/store/auth.store";

// In your auth-extension.ts
export const isUser = () => {
  const { user, decodedDto, logOut } = useAuthState.getState();

  if (!user || !decodedDto?.exp) return false;

  if (Date.now() >= decodedDto.exp * 1000) {
    logOut();
    return false;
  }

  return true;
};

export const isAdmin = () => {
  const { decodedDto, logOut } = useAuthState.getState();

  if (!decodedDto?.exp) return false;

  if (Date.now() >= decodedDto.exp * 1000) {
    logOut();
    return false;
  }

  return decodedDto.sub.roleId === 1;
};

export const isHOD = () => {
  const state = useAuthState.getState();
  //  console.log("isHOD check:", state);
  // Your admin check logic here
  return state.user && state.user.level === UserLevel.HEAD_OF_DEPT;
};

export const isDean = () => {
  const state = useAuthState.getState();
  //  console.log("isDean check:", state);
  // Your admin check logic here
  return (
    state.decodedDto && [49, 50, 51, 52].includes(state.decodedDto.sub.roleId)
  );
};

export const isDirectorOfServices = () => {
  const state = useAuthState.getState();
  //  console.log("isDirectorOfServices check:", state);
  return state.decodedDto && state.decodedDto.sub.roleId === 53;
};
