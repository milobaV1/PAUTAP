import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { ResetPasswordInput } from "@/service/interfaces/user.interface";
import { useMutation } from "@tanstack/react-query";

export async function postResetPassword(data: ResetPasswordInput) {
  try {
    const response = await client.post("/auth/reset-password", data);
    return response.data as void;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

// React Query hook
export function useResetPassword() {
  return useMutation<void, Error, ResetPasswordInput>({
    mutationFn: postResetPassword,
  });
}
