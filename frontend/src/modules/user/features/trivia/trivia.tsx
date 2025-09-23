import { useState, useEffect, useCallback } from "react";
import {
  Trophy,
  Star,
  Clock,
  Zap,
  Target,
  Crown,
  Medal,
  Award,
  Calendar,
  Users,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  type CurrentTriviaResponse,
  type StartTriviaDto,
  type TriviaQuestion,
} from "@/service/interfaces/trivia.interface";
import { useGetLeaderboard } from "./api/get-leaderboard";
import { useGetTrivia } from "./api/get-trivia";
import { useStartTrivia } from "./api/start-trivia";
import { useSubmitAnswer } from "./api/submit-answer";
import { useSubmitTrivia } from "./api/submit-trivia";
import { useAuthState } from "@/store/auth.store";
import { getParticipationStatusMessage } from "@/utils/trivia-extension";
import { useNavigate } from "@tanstack/react-router";

export function Trivia() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [participationId, setParticipationId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<
    Record<string, { answer: number; timeSpent: number }>
  >({});
  const [questionStartTime, setQuestionStartTime] = useState<number>(
    Date.now()
  );

  const { data: triviaData, isLoading, error, refetch } = useGetTrivia();
  const { data: leaderboard } = useGetLeaderboard();
  const startTriviaMutation = useStartTrivia();
  const submitAnswerMutation = useSubmitAnswer();
  const submitTriviaMutation = useSubmitTrivia();
  const { decodedDto } = useAuthState();
  const navigate = useNavigate();

  console.log("Trivia data: ", triviaData);

  // Timer effect for trivia expiration
  useEffect(() => {
    if (!triviaData?.trivia?.endedAt || !gameStarted) return;

    const endTime = new Date(triviaData.trivia.endedAt).getTime();

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        handleTriviaExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [triviaData?.trivia?.endedAt, gameStarted]);

  // Initialize timer on game start
  useEffect(() => {
    if (gameStarted && triviaData?.trivia?.endedAt) {
      const endTime = new Date(triviaData.trivia.endedAt).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      setTimeLeft(remaining);
    }
  }, [gameStarted, triviaData?.trivia?.endedAt]);

  const handleTriviaExpire = useCallback(() => {
    if (participationId) {
      submitTriviaMutation.mutate(participationId);
    }
    setGameCompleted(true);
    setGameStarted(false);
  }, [participationId, submitTriviaMutation]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startGame = async () => {
    if (!triviaData?.trivia?.id) return;
    if (!decodedDto) return;
    const data: StartTriviaDto = {
      triviaId: triviaData.trivia.id,
      userId: decodedDto?.sub.id,
    };

    try {
      const result = await startTriviaMutation.mutateAsync(data);
      setParticipationId(result.participation.id);
      setQuestions(result.questions);
      setGameStarted(true);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setQuestionStartTime(Date.now());

      // Initialize timer
      if (triviaData.trivia.endedAt) {
        const endTime = new Date(triviaData.trivia.endedAt).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
        setTimeLeft(remaining);
      }
    } catch (error) {
      console.error("Failed to start trivia:", error);
    }
  };

  const handleAnswerSelect = (answer: number) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = async () => {
    if (
      selectedAnswer === null ||
      !participationId ||
      !questions[currentQuestion]
    ) {
      return;
    }

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const currentQ = questions[currentQuestion];

    // Save answer locally
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: { answer: selectedAnswer, timeSpent },
    }));

    // Submit answer to backend
    try {
      await submitAnswerMutation.mutateAsync({
        participationId,
        questionId: currentQ.id,
        selectedAnswer,
        timeSpent,
      });
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(Date.now());
    } else {
      // Submit trivia completion
      try {
        await submitTriviaMutation.mutateAsync(participationId);
        setGameCompleted(true);
        setGameStarted(false);
      } catch (error) {
        console.error("Failed to submit trivia:", error);
      }
    }
  };

  // const resetGame = () => {
  //   setGameStarted(false);
  //   setGameCompleted(false);
  //   setCurrentQuestion(0);
  //   setSelectedAnswer(null);
  //   setQuestions([]);
  //   setParticipationId(null);
  //   setAnswers({});
  //   refetch();
  // };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-[#2e3f6f]" />
          <p className="text-muted-foreground">Loading trivia...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert className="mx-auto max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load trivia. Please try again later.
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // No trivia available
  // if (!triviaData?.trivia) {
  //   return (
  //     <Card className="pau-shadow text-center max-w-md mx-auto">
  //       <CardContent className="p-12">
  //         <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
  //         <h2 className="text-xl font-semibold text-gray-600 mb-2">
  //           No Active Trivia
  //         </h2>
  //         <p className="text-muted-foreground">
  //           {triviaData?.message ||
  //             "Check back later for the next monthly challenge!"}
  //         </p>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  if (!triviaData?.trivia) {
    return (
      <div className="space-y-6">
        <Card className="p-6 text-center">
          <Trophy className="w-10 h-10 mx-auto text-gray-400" />
          <h2 className="text-xl font-semibold mt-2">No Active Trivia</h2>
          <p className="text-gray-600 mt-2">
            There is currently no active trivia event. Please check back later.
          </p>
        </Card>

        {/* Leaderboard Section */}
        {leaderboard && leaderboard.length > 0 && (
          <Card className="pau-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                Current Leaderboard
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}{" "}
                standings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((user, index) => (
                  <div
                    key={user.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      user.userId === triviaData?.userParticipation?.userId
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? "bg-yellow-400 text-white"
                          : index === 1
                            ? "bg-gray-400 text-white"
                            : index === 2
                              ? "bg-orange-400 text-white"
                              : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {index < 3
                        ? index === 0
                          ? "🥇"
                          : index === 1
                            ? "🥈"
                            : "🥉"
                        : user.rank}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {user.user.first_name} {user.user.last_name}
                        {user.userId ===
                          triviaData?.userParticipation?.userId && (
                          <Badge className="ml-2 text-xs">You</Badge>
                        )}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{Math.round(user.averageScore)}% avg</span>
                        <span>•</span>
                        <span>{user.triviaCount} trivias</span>
                        <span>•</span>
                        <span>{user.user.role.department.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {Math.round(user.bestScore)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Best</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Game completed state
  if (
    gameCompleted ||
    triviaData.userParticipation?.status === "completed" ||
    triviaData.userParticipation?.status === "submitted"
  ) {
    const participation = triviaData.userParticipation;
    const finalScore = participation?.score || 0;

    return (
      <div className="space-y-6">
        <Card className="pau-shadow text-center">
          <CardContent className="p-12">
            <div className="mb-6">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-[#2e3f6f] mb-2">
                Trivia Complete!
              </h1>
              <p className="text-xl text-muted-foreground">
                Great job on completing this month's trivia
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round(finalScore)}%
                </div>
                <div className="text-sm text-muted-foreground">Final Score</div>
              </div>
              <div className="p-6 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {participation?.correctAnswers || 0}/
                  {participation?.totalAnswered || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Correct Answers
                </div>
              </div>
              <div className="p-6 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {participation?.timeSpent
                    ? Math.floor(participation.timeSpent / 60)
                    : 0}
                  m
                </div>
                <div className="text-sm text-muted-foreground">Time Taken</div>
              </div>
            </div>

            <Button variant="outline" onClick={() => navigate({ to: "/" })}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>

        {/* Show leaderboard */}
        {leaderboard && leaderboard.length > 0 && (
          <Card className="pau-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                Updated Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((user, index) => (
                  <div
                    key={user.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      user.userId === triviaData?.userParticipation?.userId
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? "bg-yellow-400 text-white"
                          : index === 1
                            ? "bg-gray-400 text-white"
                            : index === 2
                              ? "bg-orange-400 text-white"
                              : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {index < 3
                        ? index === 0
                          ? "🥇"
                          : index === 1
                            ? "🥈"
                            : "🥉"
                        : `${user.user.first_name[0]}${user.user.last_name[0]}`}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {user.user.first_name} {user.user.last_name}
                        {user.userId ===
                          triviaData?.userParticipation?.userId && (
                          <Badge className="ml-2 text-xs">You</Badge>
                        )}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{Math.round(user.averageScore)}% avg</span>
                        <span>•</span>
                        <span>{user.triviaCount} trivias</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Game in progress
  if (gameStarted && questions.length > 0) {
    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const participation = triviaData.userParticipation;

    return (
      <div className="space-y-6">
        {/* Progress Header */}
        <Card className="pau-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Badge className="bg-[#2e3f6f] text-white">
                  Question {currentQuestion + 1} of {questions.length}
                </Badge>
                <Badge variant="secondary">
                  <Target className="w-3 h-3 mr-1" />
                  Score:{" "}
                  {participation?.score ? Math.round(participation.score) : 0}%
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Clock
                  className={`w-4 h-4 ${timeLeft <= 60 ? "text-red-500" : "text-orange-500"}`}
                />
                <span
                  className={`font-medium ${timeLeft <= 60 ? "text-red-500" : "text-orange-500"}`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            {timeLeft <= 60 && (
              <p className="text-red-500 text-sm mt-2 text-center">
                ⚠️ Hurry up! Trivia expires soon!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="pau-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-xl flex-1">
                {currentQ.question}
              </CardTitle>
              {currentQ.category && (
                <Badge variant="secondary" className="ml-4">
                  {currentQ.category}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQ.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === index ? "default" : "outline"}
                className={`w-full text-left p-4 h-auto justify-start ${
                  selectedAnswer === index ? "pau-gradient" : ""
                }`}
                onClick={() => handleAnswerSelect(index)}
                disabled={submitAnswerMutation.isPending}
              >
                <span className="font-medium mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </Button>
            ))}

            <div className="pt-4">
              <Button
                className="w-full pau-gradient"
                disabled={
                  selectedAnswer === null || submitAnswerMutation.isPending
                }
                onClick={handleNextQuestion}
              >
                {submitAnswerMutation.isPending
                  ? "Submitting..."
                  : currentQuestion < questions.length - 1
                    ? "Next Question"
                    : "Finish Trivia"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main dashboard - can participate
  if (triviaData.canParticipate) {
    const trivia = triviaData.trivia;
    const participation = triviaData.userParticipation;
    const isInProgress = participation?.status === "in_progress";

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="flex items-center justify-center mb-2">
            <Trophy className="w-8 h-8 mr-3 text-yellow-500" />
            {trivia.title}
          </h1>
          <p className="text-muted-foreground">
            {trivia.description ||
              "Test your knowledge and compete with colleagues"}
          </p>
          <Badge className="mt-2 bg-green-100 text-green-800">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(trivia.scheduledAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}{" "}
            Challenge
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Trivia Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="pau-shadow">
              <CardHeader className="text-center">
                <div className="w-20 h-20 pau-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <CardTitle>
                  {isInProgress
                    ? "Continue Your Challenge"
                    : "Ready to Challenge Yourself?"}
                </CardTitle>
                <CardDescription>
                  {trivia.description || "Test your educational knowledge"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {trivia.totalQuestions}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Questions
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.floor(trivia.timeLimit / 60)}m
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Time Limit
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {trivia.endedAt
                        ? formatTime(
                            Math.max(
                              0,
                              Math.ceil(
                                (new Date(trivia.endedAt).getTime() -
                                  Date.now()) /
                                  1000
                              )
                            )
                          )
                        : "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Remaining
                    </div>
                  </div>
                </div>

                {/* Show progress if in progress */}
                {isInProgress && participation && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">
                      Your Progress
                    </h4>
                    <div className="flex justify-between text-sm text-yellow-700">
                      <span>
                        Answered: {participation.totalAnswered}/
                        {trivia.totalQuestions}
                      </span>
                      <span>Score: {Math.round(participation.score)}%</span>
                    </div>
                    <Progress
                      value={
                        (participation.totalAnswered / trivia.totalQuestions) *
                        100
                      }
                      className="mt-2 h-2"
                    />
                  </div>
                )}

                <Button
                  className="w-full pau-gradient text-lg py-6"
                  onClick={startGame}
                  disabled={startTriviaMutation.isPending}
                >
                  {startTriviaMutation.isPending ? (
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Star className="w-5 h-5 mr-2" />
                  )}
                  {startTriviaMutation.isPending
                    ? "Starting..."
                    : isInProgress
                      ? "Continue Trivia"
                      : "Start Trivia Challenge"}
                </Button>
              </CardContent>
            </Card>

            {/* User stats if they have participation history */}
            {participation && (
              <Card className="pau-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-[#2e3f6f]" />
                    Your Current Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-[#2e3f6f]">
                        {Math.round(participation.score)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Current Score
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-[#2e3f6f]">
                        {participation.correctAnswers}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Correct
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-[#2e3f6f]">
                        {participation.totalAnswered}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Answered
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-[#2e3f6f]">
                        {participation.timeSpent
                          ? Math.floor(participation.timeSpent / 60)
                          : 0}
                        m
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Time Spent
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            {leaderboard && leaderboard.length > 0 && (
              <Card className="pau-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                    Leaderboard
                  </CardTitle>
                  <CardDescription>Top performers this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.slice(0, 5).map((user, index) => (
                      <div
                        key={user.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg ${
                          user.userId === triviaData?.userParticipation?.userId
                            ? "bg-blue-50 border border-blue-200"
                            : "bg-gray-50"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0
                              ? "bg-yellow-400 text-white"
                              : index === 1
                                ? "bg-gray-400 text-white"
                                : index === 2
                                  ? "bg-orange-400 text-white"
                                  : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {index < 3
                            ? index === 0
                              ? "🥇"
                              : index === 1
                                ? "🥈"
                                : "🥉"
                            : `${user.user.first_name[0]}${user.user.last_name[0]}`}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {user.user.first_name} {user.user.last_name}
                            {user.userId ===
                              triviaData?.userParticipation?.userId && (
                              <Badge className="ml-2 text-xs">You</Badge>
                            )}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>{Math.round(user.averageScore)}% avg</span>
                            <span>•</span>
                            <span className="flex items-center">
                              🔥 {user.triviaCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trivia Info */}
            <Card className="pau-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-500" />
                  Trivia Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    className={
                      trivia.status === "active"
                        ? "bg-green-100 text-green-800"
                        : trivia.status === "scheduled"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }
                  >
                    {trivia.status.charAt(0).toUpperCase() +
                      trivia.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Started</span>
                  <span className="text-sm">
                    {trivia.startedAt
                      ? new Date(trivia.startedAt).toLocaleTimeString()
                      : "Not started"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Expires</span>
                  <span className="text-sm">
                    {trivia.endedAt
                      ? new Date(trivia.endedAt).toLocaleTimeString()
                      : "Not scheduled"}
                  </span>
                </div>
                {trivia.endedAt && (
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg text-center">
                    <div className="text-xs text-orange-600 mb-1">
                      Time Remaining
                    </div>
                    <div className="font-mono text-lg font-bold text-orange-700">
                      {formatTime(
                        Math.max(
                          0,
                          Math.ceil(
                            (new Date(trivia.endedAt).getTime() - Date.now()) /
                              1000
                          )
                        )
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Cannot participate (already completed or trivia not active)
  return (
    <div className="space-y-6">
      <Card className="pau-shadow text-center">
        <CardContent className="p-12">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            {triviaData.userParticipation?.status === "expired"
              ? "Trivia Expired"
              : "Trivia Not Available"}
          </h2>
          {/* <p className="text-muted-foreground mb-6">
            {triviaData.userParticipation?.status === "expired"
              ? "You ran out of time for this trivia challenge."
              : triviaData.userParticipation?.status === "completed" ||
                  triviaData.userParticipation?.status === "submitted"
                ? "You have already completed this month's trivia."
                : "This trivia is not currently active."}
          </p> */}

          <p className="text-muted-foreground mb-6">
            {getParticipationStatusMessage(triviaData?.userParticipation)}
          </p>

          {triviaData.userParticipation && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(triviaData.userParticipation.score)}%
                </div>
                <div className="text-sm text-muted-foreground">Your Score</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {triviaData.userParticipation.correctAnswers}/
                  {triviaData.userParticipation.totalAnswered}
                </div>
                <div className="text-sm text-muted-foreground">
                  Correct/Total
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {triviaData.userParticipation.timeSpent
                    ? Math.floor(triviaData.userParticipation.timeSpent / 60)
                    : 0}
                  m
                </div>
                <div className="text-sm text-muted-foreground">Time Taken</div>
              </div>
            </div>
          )}

          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Check for Updates
          </Button>
        </CardContent>
      </Card>

      {/* Show leaderboard */}
      {leaderboard && leaderboard.length > 0 && (
        <Card className="pau-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="w-5 h-5 mr-2 text-yellow-500" />
              Current Leaderboard
            </CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}{" "}
              standings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.slice(0, 10).map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    user.userId === triviaData?.userParticipation?.userId
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0
                        ? "bg-yellow-400 text-white"
                        : index === 1
                          ? "bg-gray-400 text-white"
                          : index === 2
                            ? "bg-orange-400 text-white"
                            : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {index < 3
                      ? index === 0
                        ? "🥇"
                        : index === 1
                          ? "🥈"
                          : "🥉"
                      : user.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {user.user.first_name} {user.user.last_name}
                      {user.userId ===
                        triviaData?.userParticipation?.userId && (
                        <Badge className="ml-2 text-xs">You</Badge>
                      )}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{Math.round(user.averageScore)}% avg</span>
                      <span>•</span>
                      <span>{user.triviaCount} trivias</span>
                      <span>•</span>
                      <span>{user.user.role.department.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {Math.round(user.bestScore)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Best</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
