import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { VerifyPasswordDto } from "@/service/interfaces/user.interface";
import { useMutation } from "@tanstack/react-query";

export async function verifyPassword(
  id: string,
  password: VerifyPasswordDto
): Promise<boolean> {
  try {
    const response = await client.post(
      `/users/${id}/verify-password`,
      password
    );
    return response.data.isValid;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useVerifyPassword() {
  return useMutation({
    mutationFn: ({
      id,
      password,
    }: {
      id: string;
      password: VerifyPasswordDto;
    }) => verifyPassword(id, password),
  });
}
