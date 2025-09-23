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
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  Play,
  CheckCircle,
  Clock,
  Target,
  Award,
  FileCheck,
  AlertTriangle,
} from "lucide-react";
import { Route } from "@/routes/_auth/(user)/_layout/session/$id";
import { useSessionStore } from "@/store/session.store";
//import type { UsersessionData } from "@/service/interfaces/session.interface";
import { CRISP } from "@/service/enums/crisp.enum";
import { useNavigate } from "@tanstack/react-router";
import { useStartOrResumeSession } from "./api/get-sessions";
import { useAuthState } from "@/store/auth.store";
import { useCompleteSession } from "./api/submit-session";
import { toast } from "sonner";
import { useProgressSync } from "./api/sync-session";

export function CategorySelection() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { decodedDto } = useAuthState();
  const userId = decodedDto?.sub.id;
  const {
    currentSessionData,
    localAnswers,
    sessionTimeLeft,
    setSessionTimeLeft,
    //clearSession,
  } = useSessionStore();
  const startSessionMutation = useStartOrResumeSession();
  const completeSessionMutation = useCompleteSession();

  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const progressSync = useProgressSync();

  console.log("Current session data: ", currentSessionData);
  // const { sessions, localAnswers } = useSessionStore();
  // console.log("Sessions from the store: ", sessions);
  // const session = sessions.find((s) => String(s.sessionId) === String(id)) as
  //   | UsersessionData
  //   | undefined;

  // if (!session) {
  //   return <div className="p-6">Loading session...</div>;
  // }

  useEffect(() => {
    if (id && !currentSessionData && decodedDto) {
      // Initialize full session data when entering session
      startSessionMutation.mutate({
        sessionId: id,
        userId: decodedDto.sub.id,
        roleId: decodedDto.sub.roleId,
      });
    }
  }, [id, currentSessionData, decodedDto]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (sessionTimeLeft > 0) {
      timer = setInterval(() => {
        setSessionTimeLeft(sessionTimeLeft - 1);

        // Check if time is up
        if (sessionTimeLeft <= 1) {
          setIsTimeUp(true);
          handleAutoSubmit();
        }
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [sessionTimeLeft, setSessionTimeLeft]);

  const handleAutoSubmit = async () => {
    if (!decodedDto?.sub.id) return;

    try {
      const result = await completeSessionMutation.mutateAsync({
        sessionId: id,
        payload: { userId: decodedDto.sub.id },
      });

      toast.error("Time's up! Session has been automatically submitted.");
      //clearSession();

      navigate({
        to: "/session/$id/result",
        params: { id },
        search: {
          sessionTitle: result.sessionTitle,
          finalScore: result.finalScore,
          categoryScores: JSON.stringify(result.categoryScores),
          certificateId: result.certificateId,
          completionTime: result.completionTime,
        },
      });
    } catch (error) {
      console.error("Auto-submit failed:", error);
      toast.error("Failed to auto-submit session");
    }
  };

  const handleFinalSubmit = async () => {
    if (!decodedDto?.sub.id) return;

    try {
      await progressSync.mutateAsync({
        userId: userId ?? "",
        sessionId: id,
        status: "completed", // This is crucial
      });
      const result = await completeSessionMutation.mutateAsync({
        sessionId: id,
        payload: { userId: userId ?? "" },
      });

      //     const result = await completeSessionMutation.mutateAsync({
      // //         sessionId: id,
      // //         payload: { userId: userId ?? "" },
      // //       });

      //clearSession();
      setShowConfirmSubmit(false);

      navigate({
        to: "/session/$id/result",
        params: { id },
        search: {
          sessionTitle: result.sessionTitle,
          finalScore: result.finalScore,
          categoryScores: JSON.stringify(result.categoryScores),
          certificateId: result.certificateId,
          completionTime: result.completionTime,
        },
      });
    } catch (error) {
      console.error("Final submit failed:", error);
      toast.error("Failed to submit session");
    }
  };

  if (startSessionMutation.isPending) {
    return <div className="p-6">Loading session details...</div>;
  }

  if (!currentSessionData) {
    return <div className="p-6">Failed to load session details.</div>;
  }

  const CRISP_ORDER: CRISP[] = [CRISP.C, CRISP.R, CRISP.I, CRISP.S, CRISP.P];

  // const categories = session.categories || [];
  const categories = currentSessionData.categories || [];

  const sortedCategories = [...categories].sort(
    (a, b) => CRISP_ORDER.indexOf(a.category) - CRISP_ORDER.indexOf(b.category)
  );

  const handleStartCategory = (categoryId: string) => {
    console.log("Start category", categoryId);
    // navigate to category-taking page here
    navigate({
      to: "/session/$id/category/$categoryId",
      params: { id, categoryId },
      replace: true,
    });
  };

  const handleBackToSessions = () => {
    navigate({ to: "/session" });
  };

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getTimeWarningColor = () => {
    if (sessionTimeLeft < 300) return "text-red-600"; // 5 minutes
    if (sessionTimeLeft < 600) return "text-orange-500"; // 10 minutes
    return "text-gray-700";
  };

  const totalQuestions = categories.reduce(
    (sum, cat) => sum + cat.questionsCount,
    0
  );

  // const totalQuestions = categories.reduce(
  //   (sum, cat) => sum + cat.totalQuestions,
  //   0
  // );
  const totalAnswered = Object.keys(localAnswers).length;
  const overallProgress =
    totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0;
  const isSessionComplete =
    totalAnswered === totalQuestions && totalQuestions > 0;

  // return (
  //   <div className="space-y-6">
  //     {isSessionComplete && (
  //       <Card className="pau-shadow bg-green-50 border-green-200">
  //         <CardContent className="p-6">
  //           <div className="flex items-center justify-center space-x-3">
  //             <CheckCircle className="w-6 h-6 text-green-600" />
  //             <h3 className="text-lg font-semibold text-green-800">
  //               🎉 Session Completed!
  //             </h3>
  //           </div>
  //           <p className="text-center text-green-700 mt-2">
  //             You have successfully completed all categories in this session.
  //           </p>
  //         </CardContent>
  //       </Card>
  //     )}
  //     {/* Header */}
  //     <div className="flex items-center justify-between">
  //       <Button
  //         variant="ghost"
  //         className="mb-4"
  //         onClick={() => handleBackToSessions()}
  //       >
  //         <ChevronLeft className="w-4 h-4 mr-2" />
  //         Back to sessions
  //       </Button>
  //     </div>

  //     <div className="max-w-4xl mx-auto">
  //       {/* Session Overview */}
  //       <Card className="pau-shadow mb-8">
  //         <CardHeader>
  //           <div className="flex items-start justify-between">
  //             <div className="flex-1">
  //               <CardTitle className="text-2xl mb-2">
  //                 {currentSessionData.session.title}
  //               </CardTitle>
  //               <CardDescription className="text-base">
  //                 {currentSessionData.session.description}
  //               </CardDescription>
  //             </div>
  //             <Badge variant="outline" className="text-sm">
  //               {currentSessionData.progress.totalQuestions} Questions
  //             </Badge>
  //           </div>
  //         </CardHeader>
  //         <CardContent className="space-y-6">
  //           {/* Session Details */}
  //           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
  //             <div className="text-center">
  //               <FileCheck className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
  //               <div className="font-semibold">{categories.length}</div>
  //               <div className="text-sm text-muted-foreground">Categories</div>
  //             </div>
  //             <div className="text-center">
  //               <Clock className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
  //               <div className="font-semibold">
  //                 {currentSessionData.progress.startedAt
  //                   ? "In Progress"
  //                   : "Not Started"}
  //               </div>
  //               <div className="text-sm text-muted-foreground">Status</div>
  //             </div>
  //             <div className="text-center">
  //               <Target className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
  //               <div className="font-semibold">
  //                 {currentSessionData.progress.accuracyPercentage ?? 0}%
  //               </div>
  //               <div className="text-sm text-muted-foreground">Accuracy</div>
  //             </div>
  //             <div className="text-center">
  //               <Award className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
  //               <div className="font-semibold">
  //                 {currentSessionData.progress.progressPercentage ?? 0}%
  //               </div>
  //               <div className="text-sm text-muted-foreground">Progress</div>
  //             </div>
  //           </div>

  //           {/* Overall Progress */}
  //           {currentSessionData.progress.progressPercentage > 0 && (
  //             <div className="space-y-3">
  //               <div className="flex items-center justify-between">
  //                 <h3 className="font-semibold">Overall Progress</h3>
  //                 <span className="text-sm text-muted-foreground">
  //                   {currentSessionData.progress.progressPercentage}% completed
  //                 </span>
  //               </div>
  //               <Progress
  //                 value={currentSessionData.progress.progressPercentage}
  //                 className="h-3"
  //               />
  //             </div>
  //           )}
  //         </CardContent>
  //       </Card>

  //       {/* Category Selection */}
  //       <div className="space-y-4">
  //         <div className="text-center mb-6">
  //           <h2 className="text-xl font-semibold mb-2">
  //             Choose a Category to Begin
  //           </h2>
  //           <p className="text-muted-foreground">
  //             Complete each category at your own pace.
  //           </p>
  //         </div>

  //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
  //           {sortedCategories.map((category) => {
  //             const categoryAnswers = Object.keys(localAnswers).filter(
  //               (questionId) =>
  //                 category.questions.some((q) => q.id === questionId)
  //             );
  //             const isCompleted =
  //               categoryAnswers.length === category.questionsCount;
  //             const completionPercentage =
  //               category.questionsCount > 0
  //                 ? (categoryAnswers.length / category.questionsCount) * 100
  //                 : 0;
  //             return (
  //               <Card
  //                 key={category.category}
  //                 className={`pau-shadow transition-all duration-200 border-2 ${
  //                   isCompleted
  //                     ? "bg-green-50 border-green-200"
  //                     : "hover:border-gray-300"
  //                 }`}
  //               >
  //                 <CardContent className="p-6">
  //                   <div className="flex items-start space-x-4">
  //                     <div className="flex-1 min-w-0">
  //                       <div className="flex items-center justify-between mb-2">
  //                         <h3 className="font-semibold text-lg capitalize">
  //                           {category.category}
  //                         </h3>
  //                         <div className="flex items-center space-x-2">
  //                           <Badge>{category.questionsCount} Questions</Badge>
  //                           {isCompleted && (
  //                             <Badge className="bg-green-100 text-green-800">
  //                               <CheckCircle className="w-3 h-3 mr-1" />
  //                               Completed
  //                             </Badge>
  //                           )}
  //                         </div>
  //                       </div>

  //                       {/* Progress */}
  //                       <div className="space-y-2 mb-4">
  //                         <div className="flex items-center justify-between text-sm">
  //                           <span>
  //                             Answered: {categoryAnswers.length} /{" "}
  //                             {category.questionsCount}
  //                           </span>
  //                           <span>{Math.round(completionPercentage)}%</span>
  //                         </div>
  //                         <Progress
  //                           value={completionPercentage}
  //                           className="h-2"
  //                         />
  //                       </div>
  //                       {/* Action */}
  //                       <div className="flex items-center justify-between">
  //                         {/* <div className="text-sm text-muted-foreground">
  //                           Difficulty: {currentSessionData.session.difficulty}
  //                         </div> */}
  //                         <Button
  //                           onClick={() =>
  //                             handleStartCategory(
  //                               category.categoryId.toString()
  //                             )
  //                           }
  //                           className={`pau-gradient ${isCompleted ? "opacity-75" : ""}`}
  //                           disabled={isCompleted}
  //                         >
  //                           <Play className="w-4 h-4 mr-2" />
  //                           {isCompleted ? "Retake Category" : "Start Category"}
  //                         </Button>
  //                       </div>
  //                     </div>
  //                   </div>
  //                 </CardContent>
  //               </Card>
  //             );
  //           })}
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div className="space-y-6">
      {/* Time Warning */}
      {sessionTimeLeft < 600 && sessionTimeLeft > 0 && (
        <Card className="pau-shadow bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="text-orange-800 font-medium">
                Warning: Only {formatTime(sessionTimeLeft)} remaining!
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {isSessionComplete && (
        <Card className="pau-shadow bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-800">
                🎉 All Questions Completed!
              </h3>
            </div>
            <p className="text-center text-green-700 mt-2">
              You have answered all questions. You can review and change answers
              or submit your final answers.
            </p>
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => setShowConfirmSubmit(true)}
                className="pau-gradient"
              >
                Submit Final Answers
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => handleBackToSessions()}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to sessions
        </Button>

        {/* Session Timer */}
        <div className="flex items-center space-x-2">
          <Clock className={`w-5 h-5 ${getTimeWarningColor()}`} />
          <span className={`font-mono font-bold ${getTimeWarningColor()}`}>
            {formatTime(sessionTimeLeft)}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Session Overview */}
        <Card className="pau-shadow mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">
                  {currentSessionData.session.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {currentSessionData.session.description}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-sm">
                {currentSessionData.progress.totalQuestions} Questions
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Session Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <FileCheck className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                <div className="font-semibold">{categories.length}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="text-center">
                <Clock className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                <div className="font-semibold">
                  {currentSessionData.progress.startedAt
                    ? "In Progress"
                    : "Not Started"}
                </div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
              <div className="text-center">
                <Target className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                <div className="font-semibold">
                  {currentSessionData.progress.accuracyPercentage ?? 0}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center">
                <Award className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                <div className="font-semibold">
                  {Math.round(overallProgress)}%
                </div>
                <div className="text-sm text-muted-foreground">Progress</div>
              </div>
            </div>

            {/* Overall Progress */}
            {overallProgress > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Overall Progress</h3>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(overallProgress)}% completed
                  </span>
                </div>
                <Progress value={overallProgress} className="h-3" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Selection */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">
              Choose a Category to Begin
            </h2>
            <p className="text-muted-foreground">
              Complete each category at your own pace. You can review and change
              answers anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            {sortedCategories.map((category) => {
              const categoryAnswers = Object.keys(localAnswers).filter(
                (questionId) =>
                  category.questions.some((q) => q.id === questionId)
              );
              const isCompleted =
                categoryAnswers.length === category.questionsCount;
              const completionPercentage =
                category.questionsCount > 0
                  ? (categoryAnswers.length / category.questionsCount) * 100
                  : 0;
              return (
                <Card
                  key={category.category}
                  className={`pau-shadow transition-all duration-200 border-2 ${
                    isCompleted
                      ? "bg-green-50 border-green-200"
                      : "hover:border-gray-300"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg capitalize">
                            {category.category}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Badge>{category.questionsCount} Questions</Badge>
                            {isCompleted && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span>
                              Answered: {categoryAnswers.length} /{" "}
                              {category.questionsCount}
                            </span>
                            <span>{Math.round(completionPercentage)}%</span>
                          </div>
                          <Progress
                            value={completionPercentage}
                            className="h-2"
                          />
                        </div>

                        {/* Action - Never disable buttons */}
                        <div className="flex items-center justify-between">
                          <Button
                            onClick={() =>
                              handleStartCategory(
                                category.categoryId.toString()
                              )
                            }
                            className="pau-gradient"
                            disabled={isTimeUp}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {isCompleted ? "Review Category" : "Start Category"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Final Submit Button */}
        {isSessionComplete && (
          <div className="text-center mt-8">
            <Button
              onClick={() => setShowConfirmSubmit(true)}
              className="pau-gradient text-lg px-8 py-3"
              disabled={isTimeUp}
            >
              Submit Final Answers
            </Button>
          </div>
        )}
      </div>

      {/* Confirm Final Submit Dialog */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Submit Final Answers?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                You've answered {totalAnswered}/{totalQuestions} questions.
                Remaining time: {formatTime(sessionTimeLeft)}.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Once submitted, you cannot make any changes to your answers.
              </p>
              {completeSessionMutation.isPending && (
                <p className="text-sm text-gray-600 mb-4">
                  Submitting session...
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowConfirmSubmit(false)}
                  disabled={completeSessionMutation.isPending}
                >
                  Review More
                </Button>
                <Button
                  className="flex-1 pau-gradient"
                  onClick={handleFinalSubmit}
                  disabled={completeSessionMutation.isPending}
                >
                  {completeSessionMutation.isPending
                    ? "Submitting..."
                    : "Submit Final"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
