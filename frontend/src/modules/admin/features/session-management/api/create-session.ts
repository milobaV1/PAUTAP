import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { CreateSessionDto } from "@/service/interfaces/session.interface";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export async function createSession(data: CreateSessionDto) {
  try {
    const response = await client.post("/session", data);
    return response.data;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      // ✅ invalidate so sessions refetch automatically
      queryClient.invalidateQueries({ queryKey: ["admin-session"] });
    },
  });
}
