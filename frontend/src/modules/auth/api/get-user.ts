import { client } from "@/lib/api/client";
import type { User } from "@/service/interfaces/user.interface";
import { useMutation } from "@tanstack/react-query";

export async function getUser(userId: string): Promise<User | undefined> {
  try {
    const response = await client.get(`/users/${userId}`);
    console.log(`User with id: ${userId}: `, response.data);
    return response.data as User;
  } catch (error) {
    console.error("Get user error: ", error);
  }
}

export function useGetUser() {
  return useMutation({
    mutationFn: getUser,
  });
}
