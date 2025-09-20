import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { ForgotPasswordInput } from "@/service/interfaces/user.interface";
import { useMutation } from "@tanstack/react-query";

export async function postForgotPassword(data: ForgotPasswordInput) {
  try {
    const response = await client.post("/auth/forgot-password", data);
    return response.data as void; // backend returns nothing, just success
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

// React Query hook
export function useForgotPassword() {
  return useMutation<void, Error, ForgotPasswordInput>({
    mutationFn: postForgotPassword,
  });
}
