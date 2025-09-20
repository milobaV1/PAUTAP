import { client } from "@/lib/api/client";
import type { CertificateListDto } from "@/service/interfaces/certificate.interface";
import { useMutation } from "@tanstack/react-query";

export async function getUserCertificates(
  userId: string
): Promise<CertificateListDto[] | undefined> {
  try {
    const response = await client.get(`/certificates/user/${userId}`);
    return response.data as CertificateListDto[];
  } catch (error) {
    console.error("Get user error: ", error);
  }
}

export function useGetUserCertificates() {
  return useMutation({
    mutationFn: getUserCertificates,
  });
}
