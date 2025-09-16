import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { CurrentTriviaResponse } from "@/service/interfaces/trivia.interface";

import { useQuery } from "@tanstack/react-query";

export async function getTrivia() {
  try {
    const response = await client.get(`/trivia/current`);
    return response.data as CurrentTriviaResponse;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useGetTrivia() {
  return useQuery({
    queryKey: ["trivia"],
    queryFn: async () => {
      const trivia = await getTrivia();
      return trivia;
    },
    refetchInterval: 60000,
  });
}
