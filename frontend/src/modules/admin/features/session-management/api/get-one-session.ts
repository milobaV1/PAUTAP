// api/get-one-session.ts
import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { AdminSessionSummary } from "@/service/interfaces/session.interface";
import { useQuery } from "@tanstack/react-query";

export async function getOneSession(id: string) {
  try {
    const response = await client.get(`/session/${id}`);
    return response.data as AdminSessionSummary;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useGetOneSession(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["admin-session", id],
    queryFn: () => getOneSession(id),
    enabled, // only fetch when modal opens
  });
}
