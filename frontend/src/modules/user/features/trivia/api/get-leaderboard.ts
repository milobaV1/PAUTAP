import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { LeaderboardEntry } from "@/service/interfaces/trivia.interface";
import { useQuery } from "@tanstack/react-query";

export async function getLeaderboard(month?: number, year?: number) {
  try {
    const params = new URLSearchParams();
    if (month) params.append("month", month.toString());
    if (year) params.append("year", year.toString());

    const response = await client.get(`/trivia/leaderboard?${params}`);
    return response.data as LeaderboardEntry[];
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useGetLeaderboard(month?: number, year?: number) {
  return useQuery({
    queryKey: ["leaderboard", month, year],
    queryFn: () => getLeaderboard(month, year),
  });
}
