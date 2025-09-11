// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import {
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   Flag,
//   CheckCircle,
//   AlertCircle,
//   Eye,
// } from "lucide-react";
// import { useSessionStore } from "@/store/session.store";
// import { useState, useEffect } from "react";
// import { Route } from "@/routes/(user)/_layout/session/$id/category/$categoryId";

// export function SessionTaking() {
//   const { id, categoryId } = Route.useParams();
//   const session = useSessionStore((s) =>
//     s.sessions.find((ss) => String(ss.sessionId) === String(id))
//   );

//   const currentCategory = session?.categories.find(
//     (c) => String(c.categoryId) === String(categoryId)
//   );
//   const questions = currentCategory?.questions || [];

//   const [currentQuestion, setCurrentQuestion] = useState(0);
//   const [answers, setAnswers] = useState<{ [key: number]: number }>({});
//   const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
//     new Set()
//   );
//   const [timeLeft, setTimeLeft] = useState(1080);
//   const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

//   // Timer
//   useEffect(() => {
//     if (timeLeft > 0) {
//       const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
//       return () => clearTimeout(t);
//     }
//   }, [timeLeft]);

//   if (!session || !currentCategory) {
//     return <div className="p-6">Loading session...</div>;
//   }

//   const currentQ = questions[currentQuestion];
//   const answeredCount = Object.keys(answers).length;
//   const progressPercentage =
//     questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

//   const handleAnswerSelect = (index: number) => {
//     setAnswers({ ...answers, [currentQuestion]: index });
//   };

//   const handleFlagQuestion = () => {
//     const copy = new Set(flaggedQuestions);
//     copy.has(currentQuestion)
//       ? copy.delete(currentQuestion)
//       : copy.add(currentQuestion);
//     setFlaggedQuestions(copy);
//   };

//   const handlePreviousQuestion = () => {
//     setCurrentQuestion((q) => Math.max(0, q - 1));
//   };

//   const handleNextQuestion = () => {
//     setCurrentQuestion((q) => Math.min(questions.length - 1, q + 1));
//   };

//   const handleQuestionJump = (index: number) => {
//     setCurrentQuestion(index);
//   };

//   const formatTime = (secs: number) => {
//     const m = Math.floor(secs / 60);
//     const s = secs % 60;
//     return `${m}:${s.toString().padStart(2, "0")}`;
//   };

//   const getTimeWarningColor = () => {
//     if (timeLeft < 60) return "text-red-600";
//     if (timeLeft < 300) return "text-orange-500";
//     return "text-gray-700";
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <div>
//                 <h2 className="font-semibold capitalize">
//                   {currentCategory.category}
//                 </h2>
//               </div>
//               <Badge variant="outline">
//                 Question {currentQuestion + 1} of {questions.length}
//               </Badge>
//             </div>

//             <div className="flex items-center space-x-4">
//               <Button variant="ghost" size="sm">
//                 <ChevronLeft className="w-4 h-4 mr-2" />
//                 Back to Categories
//               </Button>
//               <div className="flex items-center space-x-2">
//                 <Clock className={`w-4 h-4 ${getTimeWarningColor()}`} />
//                 <span
//                   className={`font-mono font-bold ${getTimeWarningColor()}`}
//                 >
//                   {formatTime(timeLeft)}
//                 </span>
//               </div>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setShowConfirmSubmit(true)}
//               >
//                 Submit Category
//               </Button>
//             </div>
//           </div>

//           <div className="mt-4">
//             <Progress value={progressPercentage} className="h-2" />
//           </div>
//         </div>
//       </div>

//       {/* Body */}
//       <div className="max-w-7xl mx-auto p-6">
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//           {/* Main Question */}
//           <div className="lg:col-span-3">
//             <Card className="pau-shadow">
//               <CardHeader>
//                 <div className="flex items-start justify-between">
//                   <CardTitle className="text-lg mb-4">
//                     {currentQ?.questionText}
//                   </CardTitle>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={handleFlagQuestion}
//                     className={
//                       flaggedQuestions.has(currentQuestion)
//                         ? "text-orange-600"
//                         : ""
//                     }
//                   >
//                     <Flag
//                       className={`w-4 h-4 ${
//                         flaggedQuestions.has(currentQuestion)
//                           ? "fill-current"
//                           : ""
//                       }`}
//                     />
//                   </Button>
//                 </div>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {currentQ?.options.map((option, index) => (
//                   <div
//                     key={index}
//                     className={`p-4 border rounded-lg cursor-pointer ${
//                       answers[currentQuestion] === index
//                         ? "border-[#2e3f6f] bg-[#e6f2ff]"
//                         : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
//                     }`}
//                     onClick={() => handleAnswerSelect(index)}
//                   >
//                     <div className="flex items-center space-x-3">
//                       <div
//                         className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
//                           answers[currentQuestion] === index
//                             ? "border-[#2e3f6f] bg-[#2e3f6f]"
//                             : "border-gray-300"
//                         }`}
//                       >
//                         {answers[currentQuestion] === index && (
//                           <div className="w-2 h-2 bg-white rounded-full" />
//                         )}
//                       </div>
//                       <span className="font-medium mr-3">
//                         {String.fromCharCode(65 + index)}.
//                       </span>
//                       <span className="flex-1">{option}</span>
//                     </div>
//                   </div>
//                 ))}

//                 {/* Nav */}
//                 <div className="flex items-center justify-between pt-6 border-t">
//                   <Button
//                     variant="outline"
//                     onClick={handlePreviousQuestion}
//                     disabled={currentQuestion === 0}
//                   >
//                     <ChevronLeft className="w-4 h-4 mr-2" />
//                     Previous
//                   </Button>
//                   <div className="flex items-center space-x-2">
//                     {answers[currentQuestion] !== undefined ? (
//                       <CheckCircle className="w-5 h-5 text-green-600" />
//                     ) : (
//                       <AlertCircle className="w-5 h-5 text-orange-600" />
//                     )}
//                     <span className="text-sm">
//                       {answers[currentQuestion] !== undefined
//                         ? "Answered"
//                         : "Not answered"}
//                     </span>
//                   </div>
//                   <Button
//                     variant="outline"
//                     onClick={handleNextQuestion}
//                     disabled={currentQuestion === questions.length - 1}
//                   >
//                     Next
//                     <ChevronRight className="w-4 h-4 ml-2" />
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             <Card className="pau-shadow">
//               <CardHeader>
//                 <CardTitle className="text-lg">Progress</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-[#2e3f6f]">
//                     {answeredCount}/{questions.length}
//                   </div>
//                   <Progress value={progressPercentage} className="h-2 my-2" />
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="pau-shadow">
//               <CardHeader>
//                 <CardTitle className="text-lg">Questions</CardTitle>
//                 <CardDescription>Jump to any question</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-5 gap-2">
//                   {questions.map((_, index) => (
//                     <Button
//                       key={index}
//                       size="sm"
//                       variant="outline"
//                       className={`${
//                         index === currentQuestion
//                           ? "bg-[#2e3f6f] text-white"
//                           : answers[index] !== undefined
//                             ? "bg-green-100 border-green-300 text-green-800"
//                             : flaggedQuestions.has(index)
//                               ? "bg-orange-100 border-orange-300 text-orange-800"
//                               : ""
//                       }`}
//                       onClick={() => handleQuestionJump(index)}
//                     >
//                       {index + 1}
//                     </Button>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>

//       {/* Confirm Submit Dialog */}
//       {showConfirmSubmit && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <Card className="max-w-md w-full">
//             <CardHeader>
//               <CardTitle>Submit Category?</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p>
//                 You’ve answered {answeredCount}/{questions.length}. Remaining
//                 time: {formatTime(timeLeft)}.
//               </p>
//               <div className="flex gap-2 mt-4">
//                 <Button
//                   variant="outline"
//                   className="flex-1"
//                   onClick={() => setShowConfirmSubmit(false)}
//                 >
//                   Continue
//                 </Button>
//                 <Button className="flex-1 pau-gradient">Submit</Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useState, useCallback } from "react";
import { useSessionStore } from "@/store/session.store";
import { Route } from "@/routes/(user)/_layout/session/$id/category/$categoryId";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  CheckCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useProgressSync } from "./api/sync-session";
import { useAuthState } from "@/store/auth.store";

export function SessionTaking() {
  const { id, categoryId } = Route.useParams();

  // Store state
  const {
    sessions,
    localAnswers,
    addAnswer,
    setCurrentSession,
    setCurrentCategory,
    setCurrentQuestion,
    currentQuestionIndex,
  } = useSessionStore();

  const { decodedDto } = useAuthState();
  const userId = decodedDto?.sub.id;

  const session = sessions.find((ss) => String(ss.sessionId) === String(id));
  const currentCategory = session?.categories.find(
    (c) => String(c.categoryId) === String(categoryId)
  );
  const questions = currentCategory?.questions || [];

  // Local state for UI
  const [currentQuestion, setCurrentQuestionState] = useState(
    currentQuestionIndex || 0
  );
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [timeLeft, setTimeLeft] = useState(1080);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Sync hook
  const progressSync = useProgressSync();

  // Initialize session state on component mount
  useEffect(() => {
    if (id && categoryId) {
      setCurrentSession(id);
      if (currentCategory?.category) {
        setCurrentCategory(currentCategory.category);
      }
    }
  }, [id, categoryId, setCurrentSession, setCurrentCategory]);

  // Sync current question index with store
  useEffect(() => {
    setCurrentQuestion(currentQuestion);
  }, [currentQuestion, setCurrentQuestion]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timeLeft]);

  // Auto-sync on page leave
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const unsyncedCount = useSessionStore.getState().unsyncedAnswers.length;
      if (unsyncedCount > 0) {
        e.preventDefault();
        // Attempt sync before leaving
        progressSync.mutate({
          userId: userId ?? "", // Ensure userId is always a string
          sessionId: id,
        });
        return (e.returnValue =
          "You have unsynced answers. Are you sure you want to leave?");
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const unsyncedCount = useSessionStore.getState().unsyncedAnswers.length;
        if (unsyncedCount > 0) {
          progressSync.mutate({
            userId: userId ?? "", // Replace with actual user ID
            sessionId: id,
          });
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [id, progressSync]);

  // Periodic sync every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const unsyncedCount = useSessionStore.getState().unsyncedAnswers.length;
      if (unsyncedCount > 0) {
        progressSync.mutate({
          userId: userId ?? "", // Replace with actual user ID
          sessionId: id,
        });
      }
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [id, progressSync]);

  if (!session || !currentCategory) {
    return <div className="p-6">Loading session...</div>;
  }

  const currentQ = questions[currentQuestion];

  // Count answers from both local and synced sources
  const answeredCount = Object.keys(localAnswers).length;
  const progressPercentage =
    questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  const handleAnswerSelect = (optionIndex: number) => {
    if (!currentQ) return;

    const answer = {
      questionId: currentQ.id,
      userAnswer: optionIndex,
      answeredAt: new Date(),
      category: currentCategory.category,
    };

    addAnswer(answer);
  };

  const handleFlagQuestion = () => {
    const copy = new Set(flaggedQuestions);
    copy.has(currentQuestion)
      ? copy.delete(currentQuestion)
      : copy.add(currentQuestion);
    setFlaggedQuestions(copy);
  };

  const handlePreviousQuestion = () => {
    const newIndex = Math.max(0, currentQuestion - 1);
    setCurrentQuestionState(newIndex);
  };

  const handleNextQuestion = () => {
    const newIndex = Math.min(questions.length - 1, currentQuestion + 1);
    setCurrentQuestionState(newIndex);
  };

  const handleQuestionJump = (index: number) => {
    setCurrentQuestionState(index);
  };

  const handleSubmitCategory = async () => {
    // Final sync before submission
    await progressSync.mutateAsync({
      userId: userId ?? "", // Replace with actual user ID
      sessionId: id,
      status: "in_progress",
    });

    setShowConfirmSubmit(false);
    // Navigate back to session details or next category
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getTimeWarningColor = () => {
    if (timeLeft < 60) return "text-red-600";
    if (timeLeft < 300) return "text-orange-500";
    return "text-gray-700";
  };

  // Check if current question is answered (from local answers)
  const isCurrentQuestionAnswered = localAnswers[currentQ?.id] !== undefined;
  const currentQuestionAnswer = localAnswers[currentQ?.id]?.userAnswer;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="font-semibold capitalize">
                  {currentCategory.category}
                </h2>
              </div>
              <Badge variant="outline">
                Question {currentQuestion + 1} of {questions.length}
              </Badge>
              {progressSync.isPending && (
                <Badge variant="secondary">Syncing...</Badge>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Categories
              </Button>
              <div className="flex items-center space-x-2">
                <Clock className={`w-4 h-4 ${getTimeWarningColor()}`} />
                <span
                  className={`font-mono font-bold ${getTimeWarningColor()}`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmSubmit(true)}
              >
                Submit Category
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question */}
          <div className="lg:col-span-3">
            <Card className="pau-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg mb-4">
                    {currentQ?.questionText}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFlagQuestion}
                    className={
                      flaggedQuestions.has(currentQuestion)
                        ? "text-orange-600"
                        : ""
                    }
                  >
                    <Flag
                      className={`w-4 h-4 ${
                        flaggedQuestions.has(currentQuestion)
                          ? "fill-current"
                          : ""
                      }`}
                    />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentQ?.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      currentQuestionAnswer === index
                        ? "border-[#2e3f6f] bg-[#e6f2ff]"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          currentQuestionAnswer === index
                            ? "border-[#2e3f6f] bg-[#2e3f6f]"
                            : "border-gray-300"
                        }`}
                      >
                        {currentQuestionAnswer === index && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="font-medium mr-3">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="flex-1">{option}</span>
                    </div>
                  </div>
                ))}

                {/* Nav */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestion === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <div className="flex items-center space-x-2">
                    {isCurrentQuestionAnswered ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    )}
                    <span className="text-sm">
                      {isCurrentQuestionAnswered ? "Answered" : "Not answered"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleNextQuestion}
                    disabled={currentQuestion === questions.length - 1}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="pau-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#2e3f6f]">
                    {answeredCount}/{questions.length}
                  </div>
                  <Progress value={progressPercentage} className="h-2 my-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="pau-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Questions</CardTitle>
                <CardDescription>Jump to any question</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((question, index) => {
                    const isAnswered = localAnswers[question.id] !== undefined;
                    const isCurrent = index === currentQuestion;
                    const isFlagged = flaggedQuestions.has(index);

                    return (
                      <Button
                        key={index}
                        size="sm"
                        variant="outline"
                        className={`${
                          isCurrent
                            ? "bg-[#2e3f6f] text-white"
                            : isAnswered
                              ? "bg-green-100 border-green-300 text-green-800"
                              : isFlagged
                                ? "bg-orange-100 border-orange-300 text-orange-800"
                                : ""
                        }`}
                        onClick={() => handleQuestionJump(index)}
                      >
                        {index + 1}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirm Submit Dialog */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Submit Category?</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                You've answered {answeredCount}/{questions.length}. Remaining
                time: {formatTime(timeLeft)}.
              </p>
              {progressSync.isPending && (
                <p className="text-sm text-gray-600 mt-2">
                  Syncing progress...
                </p>
              )}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowConfirmSubmit(false)}
                  disabled={progressSync.isPending}
                >
                  Continue
                </Button>
                <Button
                  className="flex-1 pau-gradient"
                  onClick={handleSubmitCategory}
                  disabled={progressSync.isPending}
                >
                  {progressSync.isPending ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
