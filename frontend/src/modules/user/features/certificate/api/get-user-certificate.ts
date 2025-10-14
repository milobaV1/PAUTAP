import { client } from "@/lib/api/client";
import type { CertificateListDto } from "@/service/interfaces/certificate.interface";
import { useMutation } from "@tanstack/react-query";

export async function getUserCertificates(
  userId: string,
  source?: "internal" | "external"
): Promise<CertificateListDto[] | undefined> {
  try {
    const endpoint = source
      ? `/certificates/user/${userId}/${source}`
      : `/certificates/user/${userId}`;
    const response = await client.get(endpoint);
    return response.data as CertificateListDto[];
  } catch (error) {
    console.error("Get user error: ", error);
  }
}

export function useGetUserCertificates() {
  return useMutation({
    mutationFn: ({
      userId,
      source,
    }: {
      userId: string;
      source?: "internal" | "external";
    }) => getUserCertificates(userId, source),
  });
}
