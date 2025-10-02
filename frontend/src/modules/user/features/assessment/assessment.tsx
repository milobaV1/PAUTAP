import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Play,
  Users,
  Heart,
  Shield,
  HandHeart,
  Briefcase,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthState } from "@/store/auth.store";
import { useGetOnboardingSession, useGetSessions } from "./api/get-sessions";
import type {
  getSessions,
  RetakeSessionDto,
  SessionSummary,
  //UsersessionData,
} from "@/service/interfaces/session.interface";
import { useRetakeSession } from "./api/retake-session";

export function sessions() {
  const navigate = useNavigate();
  const { user, decodedDto } = useAuthState();
  const sessionData: getSessions = {
    userId: decodedDto?.sub.id,
    userRoleId: decodedDto?.sub.roleId,
  };

  const isOnboardingUser = user?.is_onboarding ?? false;

  console.log("Onboarding user check? ", isOnboardingUser);

  const { data } = isOnboardingUser
    ? useGetOnboardingSession(sessionData)
    : useGetSessions(sessionData);
  //const { data, isLoading, isError, error } = useGetSessions(sessionData);
  console.log("Data: ", data);
  //const allSessions: UsersessionData[] = data || [];
  const allSessions: SessionSummary[] = data || [];

  console.log("All Sessions: ", allSessions);

  const { mutateAsync: retakeSession } = useRetakeSession();

  const retake = async (sessionId: string) => {
    const userId = decodedDto?.sub.id;
    const data: RetakeSessionDto = {
      sessionId,
      userId: userId ?? "",
    };
    await retakeSession(data);
    navigate({ to: "/session/$id", params: { id: sessionId } });
  };

  const completedSessions = allSessions.filter(
    (session) => session.isCompleted
  );
  const activeSessions = allSessions.filter((session) => !session.isCompleted);

  const sessionCategories = [
    {
      id: "community",
      name: "Community",
      icon: Users,
      color: "bg-blue-100 text-blue-800",
      description: "Building and fostering community relationships",
    },
    {
      id: "respect",
      name: "Respect",
      icon: Heart,
      color: "bg-green-100 text-green-800",
      description: "Demonstrating respect for diversity and individuals",
    },
    {
      id: "integrity",
      name: "Integrity",
      icon: Shield,
      color: "bg-purple-100 text-purple-800",
      description: "Upholding ethical standards and honesty",
    },
    {
      id: "service",
      name: "Service",
      icon: HandHeart,
      color: "bg-orange-100 text-orange-800",
      description: "Commitment to serving others and the institution",
    },
    {
      id: "professionalism",
      name: "Professionalism",
      icon: Briefcase,
      color: "bg-indigo-100 text-indigo-800",
      description: "Maintaining professional conduct and excellence",
    },
  ];

  const stats = {
    totalAvailable: activeSessions.length,
    totalCompleted: completedSessions.length,
    // averageScore: Math.round(
    //   completedsessions.reduce((acc, curr) => acc + curr.percentage, 0) /
    //     completedsessions.length
    // ),
    // passRate: Math.round(
    //   (completedsessions.filter((a) => a.status === "passed").length /
    //     completedsessions.length) *
    //     100
    // ),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "not_started":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStartsession = (sessionId: string) => {
    //onNavigate("session-taking", { sessionId });--
    navigate({ to: "/session/$id", params: { id: sessionId } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>Professional sessions</h1>
          <p className="text-muted-foreground mt-1">
            Evaluate your understanding of professional values and ethics
            through comprehensive sessions
          </p>
        </div>
      </div>

      {/* session Categories Overview */}
      <Card className="pau-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-[#2e3f6f]" />
            Session Categories
          </CardTitle>
          <CardDescription>
            Each session covers 5 core categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {sessionCategories.map((category) => (
              <div
                key={category.id}
                className="p-4 border rounded-lg text-center"
              >
                <div className="flex justify-center mb-3">
                  <div
                    className={`p-3 rounded-full ${category.color.replace("text-", "bg-").replace("800", "200")}`}
                  >
                    <category.icon
                      className={`w-6 h-6 ${category.color.includes("text-") ? category.color : "text-gray-600"}`}
                    />
                  </div>
                </div>
                <h3 className="font-medium mb-2">{category.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {category.description}
                </p>
                {/* <Badge variant="outline" className="mt-2">
                  10 Questions
                </Badge> */}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <Card className="pau-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Available
                </p>
                <p className="text-2xl font-bold mt-2">
                  {stats.totalAvailable}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="pau-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-2xl font-bold mt-2">
                  {stats.totalCompleted}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* session Tabs */}
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">
            Available sessions ({activeSessions.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeSessions.map((session) => {
              return (
                <Card
                  key={session.sessionId}
                  className="pau-shadow hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          {session.sessionTitle}
                        </CardTitle>
                        <CardDescription>
                          {session.sessionDescription}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={getStatusColor(session.status)}>
                          {session.status === "in-progress"
                            ? "in Progress"
                            : "available"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {session.status == "in_progress" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{session.progressPercentage}%</span>
                        </div>
                        <Progress
                          value={session.progressPercentage}
                          className="h-2"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <FileCheck className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>{session.totalQuestionsAvailable} questions</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* <Button variant="outline">View Details</Button> */}
                      <Button
                        className="pau-gradient"
                        onClick={() => handleStartsession(session.sessionId)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {session.status == "in_progress"
                          ? "Continue"
                          : "Start session"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6 mt-6">
          <div className="space-y-4">
            {completedSessions.map((session) => (
              <Card key={session.sessionId} className="pau-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">
                        {session.sessionTitle}
                      </h3>
                      <div className="flex items-center space-x-2"></div>
                    </div>
                    {session.accuracyPercentage ? (
                      <div
                        className={`text-3xl font-bold ${session.accuracyPercentage >= 80 ? "text-green-600" : session.accuracyPercentage >= 70 ? "text-blue-600" : "text-red-600"}`}
                      >
                        {session.accuracyPercentage}%
                      </div>
                    ) : (
                      ""
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-900">
                        {session.correctlyAnsweredQuestions}/
                        {session.totalQuestionsAvailable}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Correct Answers
                      </div>
                    </div>

                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-900">
                        {session.completedAt
                          ? new Date(session.completedAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Completed
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-900">
                        {/* {session.categories.length} */}5
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Categories
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {session.status === "passed" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        You can retake this session
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        className="pau-gradient"
                        onClick={() => retake(session.sessionId)}
                      >
                        Retake session
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
