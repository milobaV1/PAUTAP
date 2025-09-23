import { client } from "@/lib/api/client";
import { getAxiosError } from "@/lib/api/error";
import type { CreateUser } from "@/service/interfaces/user.interface";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// accepts partial update (PATCH), or full replacement (PUT) depending on backend
export async function updateUser(id: string, data: Partial<CreateUser>) {
  try {
    console.log("Data from update: ", data);
    console.log("id from update: ", id);
    const response = await client.patch(`/users/${id}`, data);
    return response.data;
  } catch (error) {
    const msg = getAxiosError(error);
    throw Error(msg);
  }
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateUser> }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user"] });
      queryClient.invalidateQueries({ queryKey: ["user-details"] });
    },
  });
}
