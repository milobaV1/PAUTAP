import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { addQuestionDto } from "@/service/interfaces/question.interface";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export async function updateQuestion(
  id: string,
  data: Partial<addQuestionDto>
) {
  try {
    const response = await client.patch(`/question-bank/${id}`, data);
    return response.data;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<addQuestionDto> }) =>
      updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
      queryClient.invalidateQueries({ queryKey: ["question-details"] });
    },
  });
}
