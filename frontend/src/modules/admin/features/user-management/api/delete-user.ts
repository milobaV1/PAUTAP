import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export async function deleteUser(id: string) {
  try {
    const response = await client.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user"] });
    },
  });
}
