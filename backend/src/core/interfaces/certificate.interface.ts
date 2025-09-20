export interface CertificateListDto {
  id: string;
  certificateId: string;
  sessionName: string;
  sessionDescription: string;
  sessionCreatedAt: Date;
  score: number;
  createdAt: Date;
  averageScore: number;
}
