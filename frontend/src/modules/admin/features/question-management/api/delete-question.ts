import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export async function deleteQuestion(id: string) {
  try {
    const response = await client.delete(`/question-bank/${id}`);
    return response.data;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
    },
  });
}
