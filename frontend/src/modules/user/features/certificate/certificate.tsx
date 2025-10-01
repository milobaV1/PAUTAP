import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Calendar, CheckCircle, Target } from "lucide-react";
import { useGetUserCertificates } from "./api/get-user-certificate";
import { useAuthState } from "@/store/auth.store";
import type { CertificateListDto } from "@/service/interfaces/certificate.interface";
import { useDownloadCertificate } from "./api/download-certificate";

export function Certificates() {
  const [certificates, setCertificates] = useState<CertificateListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: getUserCertificates } = useGetUserCertificates();
  const { mutateAsync: downloadCertificate, isPending } =
    useDownloadCertificate();
  const { decodedDto } = useAuthState();

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!decodedDto?.sub.id) return;

      try {
        setLoading(true);
        const data = await getUserCertificates(decodedDto.sub.id);
        setCertificates(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to fetch certificates");
        console.error("Error fetching certificates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [decodedDto?.sub.id, getUserCertificates]);

  // Calculate stats from actual data
  const stats = {
    totalCertificates: certificates.length,
    averageScore: certificates.length > 0 ? certificates[0].averageScore : 0,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const download = async (id: string) => {
    console.log("Certi Id: ", id);
    return await downloadCertificate(id);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1>Certificates & Achievements</h1>
            <p className="text-muted-foreground mt-1">
              Loading your certificates...
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2e3f6f]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1>Certificates & Achievements</h1>
            <p className="text-muted-foreground mt-1">
              Error loading certificates
            </p>
          </div>
        </div>
        <Card className="pau-shadow">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>Certificates & Achievements</h1>
          <p className="text-muted-foreground mt-1">
            Track your professional development milestones and download
            certificates
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="pau-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Certificates
                </p>
                <p className="text-2xl font-bold mt-2">
                  {stats.totalCertificates}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="pau-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Score
                </p>
                <p className="text-2xl font-bold mt-2">
                  {stats.averageScore.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="pau-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2 text-[#2e3f6f]" />
                Your Certificates
              </CardTitle>
              <CardDescription>
                Professional development certificates you've earned
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {certificates.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No certificates earned yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Complete training sessions to earn your first certificate!
                  </p>
                </div>
              ) : (
                certificates.map((certificate) => (
                  <div
                    key={certificate.id}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-gray-100 rounded-lg">
                          <Award className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">
                            {certificate.sessionName}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {certificate.sessionDescription ||
                              "Training Session Certificate"}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              Session:{" "}
                              {formatDate(
                                certificate.sessionCreatedAt.toString()
                              )}
                            </span>
                            <span className="flex items-center">
                              <Target className="w-3 h-3 mr-1" />
                              {certificate.score}% score
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Issued
                      </Badge>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          <p>Certificate ID: {certificate.certificateId}</p>
                          <p className="mt-1">
                            Issued:{" "}
                            {formatDate(certificate.createdAt.toString())}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            className="pau-gradient"
                            onClick={() => download(certificate.id)}
                            disabled={isPending}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          {/* Session Stats */}
          {certificates.length > 0 && (
            <Card className="pau-shadow">
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Highest Score
                    </span>
                    <span className="font-semibold">
                      {Math.max(...certificates.map((c) => c.score))}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Latest Certificate
                    </span>
                    <span className="font-semibold text-sm">
                      {certificates.length > 0
                        ? formatDate(
                            certificates
                              .sort(
                                (a, b) =>
                                  new Date(b.createdAt).getTime() -
                                  new Date(a.createdAt).getTime()
                              )[0]
                              .createdAt.toString()
                          )
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
