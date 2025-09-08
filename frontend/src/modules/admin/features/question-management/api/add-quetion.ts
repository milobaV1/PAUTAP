import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { addQuestionDto } from "@/service/interfaces/question.interface";
import { useMutation } from "@tanstack/react-query";

export async function AddQuestion(data: addQuestionDto) {
  try {
    const response = await client.post("/question-bank", data);
    return response.data;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useAddQuestion() {
  return useMutation({
    mutationFn: AddQuestion,
  });
}
