import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import { uuidToBase64 } from "@/utils/uuid-base-encoder";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export async function deleteQuestion(id: string) {
  try {
    const encodedId = uuidToBase64(id);
    const response = await client.delete(`/question-bank/${encodedId}`);
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
