import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { CreateSessionDto } from "@/service/interfaces/session.interface";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// accepts partial update (PATCH), or full replacement (PUT) depending on backend
export async function updateSession(
  id: string,
  data: Partial<CreateSessionDto>
) {
  try {
    const response = await client.patch(`/session/${id}`, data);
    return response.data;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateSessionDto>;
    }) => updateSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-session"] });
      queryClient.invalidateQueries({ queryKey: ["session-details"] });
    },
  });
}
