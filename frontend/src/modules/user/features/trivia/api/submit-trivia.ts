import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export async function submitTrivia(participationId: string) {
  try {
    const response = await client.post(`/trivia/submit/${participationId}`);
    return response.data;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useSubmitTrivia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitTrivia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trivia"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}
