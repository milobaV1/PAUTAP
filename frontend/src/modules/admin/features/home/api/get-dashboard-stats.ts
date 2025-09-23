import { client } from "@/lib/api/client";
import type { AdminDashboardStats } from "@/service/interfaces/admin.interface";
import { useQuery } from "@tanstack/react-query";

export async function getAdminDashboard(
  page: number,
  limit: number
): Promise<AdminDashboardStats> {
  const response = await client.get("/admin/dashboard/stats", {
    params: { page, limit },
  });

  return response.data;
}

export function useGetAdminDashboard(page: number, limit: number) {
  return useQuery<AdminDashboardStats, Error>({
    queryKey: ["admin-dashboard", page, limit],
    queryFn: () => getAdminDashboard(page, limit),
    placeholderData: (previousData) => previousData,
  });
}
