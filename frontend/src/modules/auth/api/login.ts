import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { LoginInterface } from "@/service/interfaces/user.interface";
import type { LoginResponse } from "@/service/types/auth.type";
import { useMutation } from "@tanstack/react-query";

export async function getLogin(data: LoginInterface) {
  try {
    const response = await client.post("/auth/login", data);
    return response.data as LoginResponse;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useGetLogin() {
  return useMutation<LoginResponse, Error, LoginInterface>({
    mutationFn: getLogin,
  });
}
