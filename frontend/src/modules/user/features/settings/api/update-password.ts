import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { UpdatePasswordDto } from "@/service/interfaces/user.interface";
import { useMutation } from "@tanstack/react-query";

export async function updatePassword(id: string, password: UpdatePasswordDto) {
  try {
    const response = await client.post(
      `/users/${id}/update-password`,
      password,
    );
    return response.data;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: ({
      id,
      password,
    }: {
      id: string;
      password: UpdatePasswordDto;
    }) => updatePassword(id, password),
  });
}
