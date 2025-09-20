import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import { useMutation } from "@tanstack/react-query";

export async function submitAnswer(data: {
  participationId: string;
  questionId: string;
  selectedAnswer: number;
  timeSpent: number;
}) {
  try {
    const response = await client.post(`/trivia/answer`, data);
    return response.data;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useSubmitAnswer() {
  return useMutation({
    mutationFn: submitAnswer,
  });
}
