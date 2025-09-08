import { useState } from "react";
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

export function Trivia() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);

  const questions = [
    {
      id: 1,
      question: "What does 'scaffolding' mean in educational context?",
      options: [
        "Building physical structures in classrooms",
        "Providing temporary support to help students achieve learning goals",
        "Creating assessment rubrics",
        "Organizing classroom furniture",
      ],
      correct: 1,
      explanation:
        "Scaffolding refers to the temporary support provided to students to help them achieve learning goals they couldn't accomplish independently.",
    },
    {
      id: 2,
      question:
        "Which learning theory emphasizes the social nature of learning?",
      options: [
        "Behaviorism",
        "Cognitivism",
        "Social Constructivism",
        "Humanism",
      ],
      correct: 2,
      explanation:
        "Social constructivism, developed by Vygotsky, emphasizes that learning is fundamentally a social process.",
    },
    {
      id: 3,
      question: "What is Bloom's Taxonomy primarily used for?",
      options: [
        "Classifying student behavior",
        "Organizing curriculum content",
        "Categorizing learning objectives",
        "Assessing teacher performance",
      ],
      correct: 2,
      explanation:
        "Bloom's Taxonomy is a framework for categorizing educational goals and learning objectives.",
    },
  ];

  const leaderboard = [
    {
      name: "Dr. Sarah Johnson",
      score: 2850,
      avatar: "SJ",
      streak: 12,
      position: 1,
    },
    {
      name: "Prof. Michael Chen",
      score: 2720,
      avatar: "MC",
      streak: 8,
      position: 2,
    },
    {
      name: "Michael Iloba",
      score: 2450,
      avatar: "JS",
      streak: 5,
      position: 3,
    },
    {
      name: "Dr. Emily Rodriguez",
      score: 2380,
      avatar: "ER",
      streak: 6,
      position: 4,
    },
    {
      name: "Prof. David Lee",
      score: 2290,
      avatar: "DL",
      streak: 3,
      position: 5,
    },
  ];

  const monthlyStats = {
    totalParticipants: 156,
    averageScore: 78,
    highScore: 95,
    yourBestScore: 88,
    streak: 5,
    totalPoints: 2450,
    rank: 3,
  };

  const badges = [
    {
      name: "First Timer",
      icon: "🎯",
      description: "Complete your first trivia",
      earned: true,
    },
    {
      name: "Speed Demon",
      icon: "⚡",
      description: "Answer 5 questions in under 10 seconds each",
      earned: true,
    },
    {
      name: "Perfect Score",
      icon: "🏆",
      description: "Score 100% on monthly trivia",
      earned: false,
    },
    {
      name: "Streak Master",
      icon: "🔥",
      description: "Maintain a 10-game win streak",
      earned: false,
    },
    {
      name: "Knowledge Guru",
      icon: "🧠",
      description: "Reach top 3 on leaderboard",
      earned: true,
    },
    {
      name: "Trivia Champion",
      icon: "👑",
      description: "Win monthly trivia championship",
      earned: false,
    },
  ];

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === questions[currentQuestion].correct) {
      setScore(score + 100);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
    } else {
      setGameCompleted(true);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setTimeLeft(30);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setTimeLeft(30);
  };

  if (gameCompleted) {
    const finalScore = Math.round((score / (questions.length * 100)) * 100);
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {finalScore}%
                </div>
                <div className="text-sm text-muted-foreground">Final Score</div>
              </div>
              <div className="p-6 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{score}</div>
                <div className="text-sm text-muted-foreground">
                  Points Earned
                </div>
              </div>
              {/* <div className="p-6 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">+50</div>
                <div className="text-sm text-muted-foreground">
                  Bonus Points
                </div>
              </div> */}
            </div>

            {/* <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={resetGame}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button className="pau-gradient">
                <Award className="w-4 h-4 mr-2" />
                View Certificate
              </Button>
            </div> */}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameStarted) {
    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

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
                  <Zap className="w-3 h-3 mr-1" />
                  {score} points
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-orange-500">{timeLeft}s</span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="pau-shadow">
          <CardHeader>
            <CardTitle className="text-xl">{currentQ.question}</CardTitle>
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
                disabled={selectedAnswer === null}
                onClick={handleNextQuestion}
              >
                {currentQuestion < questions.length - 1
                  ? "Next Question"
                  : "Finish Trivia"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="flex items-center justify-center mb-2">
          <Trophy className="w-8 h-8 mr-3 text-yellow-500" />
          Monthly Trivia Challenge
        </h1>
        <p className="text-muted-foreground">
          Test your educational knowledge and compete with colleagues
        </p>
        <Badge className="mt-2 bg-green-100 text-green-800">
          <Calendar className="w-3 h-3 mr-1" />
          January 2025 Challenge
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
              <CardTitle>Ready to Challenge Yourself?</CardTitle>
              <CardDescription>
                This month's trivia focuses on modern pedagogical methods and
                educational psychology
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {questions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Questions</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">30s</div>
                  <div className="text-sm text-muted-foreground">
                    Per Question
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">300</div>
                  <div className="text-sm text-muted-foreground">
                    Max Points
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">+50</div>
                  <div className="text-sm text-muted-foreground">Bonus</div>
                </div>
              </div>

              <Button
                className="w-full pau-gradient text-lg py-6"
                onClick={startGame}
              >
                <Star className="w-5 h-5 mr-2" />
                Start Trivia Challenge
              </Button>
            </CardContent>
          </Card>

          {/* Your Stats */}
          <Card className="pau-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-[#2e3f6f]" />
                Your Monthly Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-[#2e3f6f]">
                    #{monthlyStats.rank}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Current Rank
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-[#2e3f6f]">
                    {monthlyStats.yourBestScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Best Score
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-[#2e3f6f]">
                    {monthlyStats.streak}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Win Streak
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-[#2e3f6f]">
                    {monthlyStats.totalPoints}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Points
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Leaderboard */}
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
                {leaderboard.map((user, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      user.name.includes("You")
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
                        : user.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{user.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{user.score} pts</span>
                        <span>•</span>
                        <span className="flex items-center">
                          🔥 {user.streak}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
