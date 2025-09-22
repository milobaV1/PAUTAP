import { client } from "@/lib/api/client";
import type { AdminQuestionsResponse } from "@/service/interfaces/question.interface";
import { useQuery } from "@tanstack/react-query";

export async function getAdminQuestions(
  page = 1,
  limit = 5
): Promise<AdminQuestionsResponse> {
  console.log("Get questions 2");
  const response = await client.get("/question-bank/admin", {
    params: { page, limit },
  });
  console.log("Get questions 3 with data: ", response.data);
  return response.data;
}

export function useAdminQuestions(page: number, limit: number) {
  console.log("Get questions 1");
  return useQuery<AdminQuestionsResponse, Error>({
    queryKey: ["admin-questions", page, limit],
    queryFn: () => getAdminQuestions(page, limit),
    placeholderData: (previousData) => previousData, // replaces keepPreviousData
  });
}
