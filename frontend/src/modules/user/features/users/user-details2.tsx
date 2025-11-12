import {
  ArrowLeft,
  Mail,
  Calendar,
  Award,
  BookOpen,
  FileText,
  Shield,
  Loader2,
  Filter,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useGetOneUserWithDetails } from "./api/get-one-user";
//import { useUpdateUser } from "./api/update-user";
import { useMemo, useState } from "react";
import type { GetUserDetailsParams } from "@/service/interfaces/user.interface";
import { format } from "date-fns";
import { Route } from "@/routes/_auth/(user)/_layout/users/$id";
//import { useDeleteUser } from "./api/delete-user";

interface UserDetailsPageProps {
  onBack: () => void;
}

export function StaffDetailsPage({ onBack }: UserDetailsPageProps) {
  const { id } = Route.useParams();
  //const navigate = useNavigate();
  const [sessionsPage, setSessionsPage] = useState(1);
  const [certificatesPage, setCertificatesPage] = useState(1);
  const [sessionsDateRange, setSessionsDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [certificatesDateRange, setCertificatesDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const params = useMemo(() => {
    const p: GetUserDetailsParams = {
      sessionsPage,
      certificatesPage,
    };

    if (sessionsDateRange.from && sessionsDateRange.to) {
      p.sessionsStartDate = sessionsDateRange.from.toISOString();
      p.sessionsEndDate = sessionsDateRange.to.toISOString();
    }

    if (certificatesDateRange.from && certificatesDateRange.to) {
      p.certificatesStartDate = certificatesDateRange.from.toISOString();
      p.certificatesEndDate = certificatesDateRange.to.toISOString();
    }

    return p;
  }, [
    sessionsPage,
    certificatesPage,
    sessionsDateRange,
    certificatesDateRange,
  ]);

  const { data, isLoading, error } = useGetOneUserWithDetails(id, params);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "not_started":
      case "not-started":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "Completed";
      case "in_progress":
      case "in-progress":
        return "In Progress";
      case "not_started":
      case "not-started":
        return "Not Started";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Less than an hour ago";
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
    return formatDate(dateString);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2e3f6f]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">
              Error loading user details: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (!data) return null;
  const { user, sessions, certificates, statistics } = data;

  const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Users
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-[#2e3f6f] text-white text-xl">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {user.firstName} {user.lastName}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Shield className="w-3 h-3" />
                    {user.role?.name || "No Role"}
                  </Badge>
                  <Badge className="bg-gray-100 text-gray-800">
                    {user.level}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="text-gray-900">
                      {user.role?.department?.name || "No Department"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Join Date</p>
                    <p className="text-gray-900">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-gray-900">
                      {getTimeAgo(user.updatedAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Available Sessions
                  </span>
                  <span className="font-semibold text-gray-900">
                    {statistics.totalAvailableSessions}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Sessions Enrolled
                  </span>
                  <span className="font-semibold text-gray-900">
                    {statistics.totalSessionsEnrolled}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">
                    {statistics.completedSessions}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="font-semibold text-blue-600">
                    {statistics.inProgressSessions}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Certificates</span>
                  <span className="font-semibold text-gray-900">
                    {statistics.totalCertificates}
                  </span>
                </div>
                {statistics.averageScore > 0 && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Average Score
                      </span>
                      <span className="font-semibold text-gray-900">
                        {statistics.averageScore}%
                      </span>
                    </div>
                  </>
                )}
                {statistics.overallAccuracy > 0 && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Overall Accuracy
                      </span>
                      <span className="font-semibold text-gray-900">
                        {statistics.overallAccuracy}%
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sessions and Certificates */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Session Progress</CardTitle>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="w-4 h-4" />
                        {(sessionsDateRange.from || sessionsDateRange.to) && (
                          <span className="ml-1 h-2 w-2 rounded-full bg-blue-600" />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4" align="end">
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm">
                          Filter Sessions by Date
                        </h4>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            From Date
                          </label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {sessionsDateRange.from
                                  ? format(sessionsDateRange.from, "PPP")
                                  : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <CalendarComponent
                                mode="single"
                                selected={sessionsDateRange.from}
                                onSelect={(date) => {
                                  setSessionsDateRange((prev) => ({
                                    ...prev,
                                    from: date,
                                  }));
                                  setSessionsPage(1);
                                }}
                                autoFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            To Date
                          </label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {sessionsDateRange.to
                                  ? format(sessionsDateRange.to, "PPP")
                                  : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <CalendarComponent
                                mode="single"
                                selected={sessionsDateRange.to}
                                onSelect={(date) => {
                                  setSessionsDateRange((prev) => ({
                                    ...prev,
                                    to: date,
                                  }));
                                  setSessionsPage(1);
                                }}
                                autoFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setSessionsDateRange({
                              from: undefined,
                              to: undefined,
                            });
                            setSessionsPage(1);
                          }}
                        >
                          Clear Filter
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No sessions available</p>
                  </div>
                ) : (
                  <>
                    {sessions.map((session) => (
                      <div
                        key={session.sessionId}
                        className="p-4 border border-gray-200 rounded-lg hover:border-[#2e3f6f] transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <h3 className="font-semibold text-gray-900">
                            {session.sessionTitle}
                          </h3>
                          {session.hasProgress && session.progress ? (
                            <Badge
                              className={getStatusColor(
                                session.progress.status
                              )}
                            >
                              {getStatusLabel(session.progress.status)}
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">
                              Not Started
                            </Badge>
                          )}
                        </div>

                        {session.sessionDescription && (
                          <p className="text-sm text-gray-600 mb-3">
                            {session.sessionDescription}
                          </p>
                        )}

                        {session.hasProgress && session.progress ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {session.progress.answeredQuestions} of{" "}
                                {session.progress.totalQuestions} questions
                                answered
                              </span>
                              <span className="font-medium text-gray-900">
                                {Math.round(
                                  session.progress.progressPercentage
                                )}
                                %
                              </span>
                            </div>
                            <Progress
                              value={Number(
                                session.progress.progressPercentage
                              )}
                              // value={session.progress.progressPercentage}
                              className="h-2"
                            />
                            <div className="flex justify-between text-sm pt-1">
                              <span className="text-gray-500">
                                Score: {session.progress.overallScore}%
                              </span>
                              <span className="text-gray-500">
                                Accuracy:{" "}
                                {Math.round(
                                  session.progress.accuracyPercentage
                                )}
                                %
                              </span>
                            </div>
                            {session.progress.lastActiveAt && (
                              <p className="text-sm text-gray-500">
                                Last activity:{" "}
                                {getTimeAgo(session.progress.lastActiveAt)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Session not started yet
                          </p>
                        )}
                      </div>
                    ))}
                    {data?.pagination?.sessions && (
                      <PaginationControls
                        currentPage={data.pagination.sessions.currentPage}
                        totalPages={data.pagination.sessions.totalPages}
                        onPageChange={setSessionsPage}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Certificates
                  </CardTitle>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="w-4 h-4" />
                        {(certificatesDateRange.from ||
                          certificatesDateRange.to) && (
                          <span className="ml-1 h-2 w-2 rounded-full bg-blue-600" />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4" align="end">
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm">
                          Filter Certificates by Date
                        </h4>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            From Date
                          </label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {certificatesDateRange.from
                                  ? format(certificatesDateRange.from, "PPP")
                                  : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <CalendarComponent
                                mode="single"
                                selected={certificatesDateRange.from}
                                onSelect={(date) => {
                                  setCertificatesDateRange((prev) => ({
                                    ...prev,
                                    from: date,
                                  }));
                                  setCertificatesPage(1);
                                }}
                                autoFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            To Date
                          </label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {certificatesDateRange.to
                                  ? format(certificatesDateRange.to, "PPP")
                                  : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <CalendarComponent
                                mode="single"
                                selected={certificatesDateRange.to}
                                onSelect={(date) => {
                                  setCertificatesDateRange((prev) => ({
                                    ...prev,
                                    to: date,
                                  }));
                                  setCertificatesPage(1);
                                }}
                                autoFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setCertificatesDateRange({
                              from: undefined,
                              to: undefined,
                            });
                            setCertificatesPage(1);
                          }}
                        >
                          Clear Filter
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardHeader>
              <CardContent>
                {certificates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No certificates earned yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-[#2e3f6f] transition-colors"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-[#2e3f6f] rounded flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {cert.title || cert.sessionTitle || "Certificate"}
                          </h3>
                          {cert.issuedBy && (
                            <p className="text-sm text-gray-500">
                              {cert.issuedBy}
                            </p>
                          )}
                          {cert.score !== null && (
                            <p className="text-sm text-gray-600">
                              Score: {cert.score}%
                            </p>
                          )}
                          <p className="text-sm text-gray-400">
                            {formatDate(cert.issuedDate || cert.createdAt)}
                          </p>
                        </div>
                        <Badge variant="outline">{cert.source}</Badge>
                      </div>
                    ))}
                    {data?.pagination?.certificates && (
                      <PaginationControls
                        currentPage={data.pagination.certificates.currentPage}
                        totalPages={data.pagination.certificates.totalPages}
                        onPageChange={setCertificatesPage}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
