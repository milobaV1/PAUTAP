import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { CreateUser } from "@/service/interfaces/user.interface";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export async function createUser(data: CreateUser) {
  try {
    const response = await client.post("/users", data);
    return response.data;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // ✅ invalidate so sessions refetch automatically
      queryClient.invalidateQueries({ queryKey: ["admin-user"] });
    },
  });
}
