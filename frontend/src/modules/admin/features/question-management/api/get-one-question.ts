import { client } from "@/lib/api/client";
import type { Question } from "@/service/interfaces/question.interface";
import { useQuery } from "@tanstack/react-query";

export async function getOneQuestion(id: string): Promise<Question> {
  const response = await client.get(`/question-bank/${id}`);
  console.log("Full API response:", response.data);
  console.log("Roles in response:", response.data.roles);
  return response.data;
}

export function useGetOneQuestion(id: string, enabled: boolean = true) {
  return useQuery<Question, Error>({
    queryKey: ["question-details", id],
    queryFn: () => getOneQuestion(id),
    enabled,
    //     placeholderData: (previousData) => previousData, // replaces keepPreviousData
  });
}
