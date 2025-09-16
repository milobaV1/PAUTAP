import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { StartTriviaResponse } from "@/service/interfaces/trivia.interface";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export async function startTrivia(triviaId: string) {
  try {
    const response = await client.post(`/trivia/start`, { triviaId });
    return response.data as StartTriviaResponse;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useStartTrivia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startTrivia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trivia"] });
    },
  });
}
