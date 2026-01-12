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
import {
  Award,
  Download,
  Calendar,
  CheckCircle,
  Target,
  ExternalLink,
} from "lucide-react";
import { useGetUserCertificates } from "./api/get-user-certificate";
import { useAuthState } from "@/store/auth.store";
import type { CertificateListDto } from "@/service/interfaces/certificate.interface";
import { useDownloadCertificate } from "./api/download-certificate";
import { CertificateUploadDialog } from "./certificate-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Certificates() {
  const [allCertificates, setAllCertificates] = useState<CertificateListDto[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "internal" | "external">(
    "all"
  );

  const { mutateAsync: getUserCertificates } = useGetUserCertificates();
  const { mutateAsync: downloadCertificate, isPending } =
    useDownloadCertificate();
  const { decodedDto } = useAuthState();

  // Fetch all certificates once on mount
  useEffect(() => {
    const fetchAllCertificates = async () => {
      if (!decodedDto?.sub.id) return;

      try {
        setLoading(true);
        const data = await getUserCertificates({
          userId: decodedDto.sub.id,
          source: undefined, // Fetch all
        });
        setAllCertificates(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to fetch certificates");
        console.error("Error fetching certificates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCertificates();
  }, [decodedDto?.sub.id]);

  // Filter certificates based on active tab
  const certificates =
    activeTab === "all"
      ? allCertificates
      : allCertificates.filter((c) => c.source === activeTab);

  const handleUploadSuccess = () => {
    // Refetch all certificates after successful upload
    const fetchAllCertificates = async () => {
      if (!decodedDto?.sub.id) return;

      try {
        const data = await getUserCertificates({
          userId: decodedDto.sub.id,
          source: undefined, // Fetch all
        });
        setAllCertificates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error refetching certificates:", err);
      }
    };

    fetchAllCertificates();
  };

  // Calculate stats from ALL certificates (not filtered)
  const internalCerts = allCertificates.filter((c) => c.source === "internal");
  const externalCerts = allCertificates.filter((c) => c.source === "external");

  const stats = {
    totalCertificates: allCertificates.length,
    internalCount: internalCerts.length,
    externalCount: externalCerts.length,
    averageScore:
      allCertificates.length > 0 ? allCertificates[0].averageScore : 0,
    highestScore:
      internalCerts.length > 0
        ? Math.max(...internalCerts.map((c) => c.score || 0))
        : 0,
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const download = async (id: string) => {
    //  console.log("Certi Id: ", id);
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
        {decodedDto?.sub.id && (
          <CertificateUploadDialog
            userId={decodedDto.sub.id}
            onSuccess={handleUploadSuccess}
          />
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  Training Certificates
                </p>
                <p className="text-2xl font-bold mt-2">{stats.internalCount}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="pau-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  External Certificates
                </p>
                <p className="text-2xl font-bold mt-2">{stats.externalCount}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <ExternalLink className="w-6 h-6 text-purple-600" />
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
                  {stats.averageScore ? stats.averageScore.toFixed(1) : "N/A"}%
                </p>
              </div>
              <div className="p-3 rounded-full bg-amber-100">
                <Target className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Certificates */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All ({stats.totalCertificates})</TabsTrigger>
          <TabsTrigger value="internal">
            Training ({stats.internalCount})
          </TabsTrigger>
          <TabsTrigger value="external">
            External ({stats.externalCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Certificates List */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="pau-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2 text-[#2e3f6f]" />
                    {activeTab === "all"
                      ? "Your Certificates"
                      : activeTab === "internal"
                        ? "Training Certificates"
                        : "External Certificates"}
                  </CardTitle>
                  <CardDescription>
                    {activeTab === "all"
                      ? "All your professional development certificates"
                      : activeTab === "internal"
                        ? "Certificates earned from training sessions"
                        : "Certificates uploaded from external platforms"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {certificates.length === 0 ? (
                    <div className="text-center py-12">
                      <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">
                        {activeTab === "all"
                          ? "No certificates yet"
                          : activeTab === "internal"
                            ? "No training certificates yet"
                            : "No external certificates uploaded"}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {activeTab === "all" || activeTab === "internal"
                          ? "Complete training sessions to earn your first certificate!"
                          : "Upload certificates from external courses like Udemy, Coursera, etc."}
                      </p>
                    </div>
                  ) : (
                    certificates.map((certificate) => (
                      <div
                        key={certificate.id}
                        className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="p-3 bg-gray-100 rounded-lg">
                              {certificate.source === "internal" ? (
                                <Award className="w-6 h-6 text-blue-600" />
                              ) : (
                                <ExternalLink className="w-6 h-6 text-purple-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">
                                {certificate.sessionName}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                {certificate.sessionDescription ||
                                  (certificate.source === "internal"
                                    ? "Training Session Certificate"
                                    : "External Platform Certificate")}
                              </p>

                              {/* Certificate Details */}
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                {certificate.issuedBy && (
                                  <span className="flex items-center">
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    {certificate.issuedBy}
                                  </span>
                                )}

                                {certificate.issuedDate ? (
                                  <span className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Issued:{" "}
                                    {formatDate(
                                      certificate.issuedDate.toString()
                                    )}
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Session:{" "}
                                    {formatDate(
                                      certificate.sessionCreatedAt.toString()
                                    )}
                                  </span>
                                )}

                                {certificate.score !== null && (
                                  <span className="flex items-center">
                                    <Target className="w-3 h-3 mr-1" />
                                    {certificate.score}% score
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Badge */}
                          <Badge className="bg-green-100 text-green-800 whitespace-nowrap">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {certificate.source === "internal"
                              ? "Earned"
                              : "Verified"}
                          </Badge>
                        </div>

                        {/* Footer */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                              <p>Certificate ID: {certificate.certificateId}</p>
                              <p className="mt-1">
                                Added:{" "}
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

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Performance Overview */}
              {internalCerts.length > 0 && (
                <Card className="pau-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Performance Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Highest Score
                      </span>
                      <span className="font-semibold">
                        {stats.highestScore}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Average Score
                      </span>
                      <span className="font-semibold">
                        {stats.averageScore
                          ? stats.averageScore.toFixed(1)
                          : "N/A"}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Total Completed
                      </span>
                      <span className="font-semibold">
                        {internalCerts.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Latest Certificate
                      </span>
                      <span className="font-semibold text-sm">
                        {internalCerts.length > 0
                          ? formatDate(
                              internalCerts
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
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
