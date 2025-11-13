import { client } from "@/lib/api/client";
import type {
  GetUserDetailsParams,
  User,
  UserData,
} from "@/service/interfaces/user.interface";
import { useQuery } from "@tanstack/react-query";

export async function getOneUser(id: string): Promise<User> {
  const response = await client.get(`/users/${id}`);
  console.log("Users from the api call: ", response.data);
  return response.data;
}

export function useGetOneUser(id: string, enabled: boolean = true) {
  return useQuery<User, Error>({
    queryKey: ["user", id],
    queryFn: () => getOneUser(id),
    enabled,
    //     placeholderData: (previousData) => previousData, // replaces keepPreviousData
  });
}

export async function getOneUserWithDetails(
  id: string,
  params?: GetUserDetailsParams
): Promise<UserData> {
  const queryParams = new URLSearchParams();

  if (params?.sessionsPage)
    queryParams.append("sessionsPage", params.sessionsPage.toString());
  if (params?.certificatesPage)
    queryParams.append("certificatesPage", params.certificatesPage.toString());
  if (params?.sessionsStartDate)
    queryParams.append("sessionsStartDate", params.sessionsStartDate);
  if (params?.sessionsEndDate)
    queryParams.append("sessionsEndDate", params.sessionsEndDate);
  if (params?.certificatesStartDate)
    queryParams.append("certificatesStartDate", params.certificatesStartDate);
  if (params?.certificatesEndDate)
    queryParams.append("certificatesEndDate", params.certificatesEndDate);

  const queryString = queryParams.toString();
  const response = await client.get(
    `/users/${id}/details${queryString ? `?${queryString}` : ""}`
  );
  console.log("Users from the api call: ", response.data);
  return response.data;
}

export function useGetOneUserWithDetails(
  id: string,
  params?: GetUserDetailsParams,
  enabled: boolean = true
) {
  return useQuery<UserData, Error>({
    queryKey: ["user-details", id, params],
    queryFn: () => getOneUserWithDetails(id, params),
    enabled,
    //     placeholderData: (previousData) => previousData, // replaces keepPreviousData
  });
}
