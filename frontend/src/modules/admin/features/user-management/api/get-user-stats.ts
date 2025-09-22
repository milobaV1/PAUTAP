import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { AdminStatsUserResponse } from "@/service/interfaces/user.interface";
import { useQuery } from "@tanstack/react-query";

export async function getUserForAdmin(page = 1, limit = 5) {
  try {
    const response = await client.get(`/users/admin/stats`, {
      params: { page, limit },
    });
    return response.data as AdminStatsUserResponse;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useGetUserForAdmin(page: number, limit: number) {
  return useQuery({
    queryKey: ["admin-user", page, limit],
    queryFn: () => getUserForAdmin(page, limit),
    placeholderData: (previousData) => previousData,
  });
}
