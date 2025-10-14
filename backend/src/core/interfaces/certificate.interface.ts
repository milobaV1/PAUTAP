// export interface CertificateListDto {
//   id: string;
//   certificateId: string;
//   sessionName: string;
//   sessionDescription: string;
//   sessionCreatedAt: Date;
//   score: number;
//   createdAt: Date;
//   averageScore: number;
// }

export interface CertificateListDto {
  id: string;
  certificateId: string;
  source: 'internal' | 'external';
  sessionName: string;
  sessionDescription: string;
  sessionCreatedAt: Date;
  score: number | null;
  createdAt: Date;
  issuedBy: string | null;
  issuedDate: Date | null;
  averageScore: number | null;
}
