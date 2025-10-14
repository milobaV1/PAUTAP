import { client } from "@/lib/api/client";
import type { UploadCertificatePayload } from "@/service/interfaces/certificate.interface";
import { useMutation } from "@tanstack/react-query";

export async function uploadCertificate(
  userId: string,
  payload: UploadCertificatePayload
) {
  try {
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("title", payload.title);
    if (payload.issuedBy) {
      formData.append("issuedBy", payload.issuedBy);
    }
    if (payload.issuedDate) {
      formData.append("issuedDate", payload.issuedDate);
    }

    const response = await client.post(
      `/certificates/upload/${userId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Upload error: ", error);
    throw error;
  }
}

export function useUploadCertificate() {
  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UploadCertificatePayload;
    }) => uploadCertificate(userId, payload),
  });
}
