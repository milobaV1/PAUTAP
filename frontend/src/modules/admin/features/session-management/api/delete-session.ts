import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export async function deleteSession(id: string) {
  try {
    const response = await client.delete(`/session/${id}`);
    return response.data;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-session"] });
    },
  });
}
