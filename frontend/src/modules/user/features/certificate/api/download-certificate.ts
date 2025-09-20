import { client } from "@/lib/api/client";
import { useMutation } from "@tanstack/react-query";

export async function downloadCertificate(id: string) {
  try {
    const response = await client.get(`/certificates/download/${id}`, {
      responseType: "blob", // expect binary data
    });

    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));

    // Create a link element and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `certificate-${id}.pdf`);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Download error: ", error);
    return false;
  }
}

export function useDownloadCertificate() {
  return useMutation({
    mutationFn: downloadCertificate,
  });
}
