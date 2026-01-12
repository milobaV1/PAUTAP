import { client } from "@/lib/api/client";
import type { AdminQuestionsResponse } from "@/service/interfaces/question.interface";
import { useQuery } from "@tanstack/react-query";

export async function getAdminQuestions(
  page = 1,
  limit = 5,
  searchTerm = ""
): Promise<AdminQuestionsResponse> {
  //  console.log("Get questions 2");
  const response = await client.get("/question-bank/admin", {
    params: { page, limit, search: searchTerm },
  });
  //  console.log("Get questions 3 with data: ", response.data);
  return response.data;
}

export function useAdminQuestions(
  page: number,
  limit: number,
  searchTerm: string
) {
  //  console.log("Get questions 1");
  return useQuery<AdminQuestionsResponse, Error>({
    queryKey: ["admin-questions", page, limit, searchTerm],
    queryFn: () => getAdminQuestions(page, limit, searchTerm),
    placeholderData: (previousData) => previousData, // replaces keepPreviousData
  });
}
