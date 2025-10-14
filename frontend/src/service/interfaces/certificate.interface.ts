export interface CertificateListDto {
  id: string;
  certificateId: string;
  source: "internal" | "external";
  sessionName: string;
  sessionDescription: string;
  sessionCreatedAt: Date;
  score: number | null;
  createdAt: Date;
  issuedBy: string | null;
  issuedDate: Date | null;
  averageScore: number | null;
}
export interface UploadCertificatePayload {
  title: string;
  issuedBy?: string;
  issuedDate?: string;
  file: File;
}
