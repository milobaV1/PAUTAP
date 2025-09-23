import { client } from "@/lib/api/client";
import type { User } from "@/service/interfaces/user.interface";
import { useQuery } from "@tanstack/react-query";

export async function getOneUser(id: string): Promise<User> {
  const response = await client.get(`/users/${id}`);
  console.log("Users from the api call: ", response.data);
  return response.data;
}

export function useGetOneUser(id: string, enabled: boolean = true) {
  return useQuery<User, Error>({
    queryKey: ["user-details", id],
    queryFn: () => getOneUser(id),
    enabled,
    //     placeholderData: (previousData) => previousData, // replaces keepPreviousData
  });
}
