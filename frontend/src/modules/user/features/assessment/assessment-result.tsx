import React from "react";
import { useNavigate } from "@tanstack/react-router";
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
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  TrendingUp,
  Award,
  Download,
  RefreshCw,
  BookOpen,
  Share,
} from "lucide-react";

interface SessionResultsProps {
  sessionId: string;
  finalScore: number;
  categoryScores: Record<string, number>;
  certificateId: string;
  completionTime: number;
}

export function SessionResults({
  sessionId,
  finalScore,
  categoryScores,
  certificateId,
  completionTime,
}: SessionResultsProps) {
  const navigate = useNavigate();
  const passingScore = 80; // Should match your backend logic
  const passed = finalScore >= passingScore;

  // Convert category scores to display format
  const crispCategories = [
    { key: "cScore", label: "Community", score: categoryScores.cScore || 0 },
    { key: "rScore", label: "Respect", score: categoryScores.rScore || 0 },
    { key: "iScore", label: "Integriy", score: categoryScores.iScore || 0 },
    { key: "sScore", label: "Service", score: categoryScores.sScore || 0 },
    {
      key: "pScore",
      label: "Professionalism",
      score: categoryScores.pScore || 0,
    },
  ];

  const recommendations = passed
    ? [
        "Excellent work! You've demonstrated strong understanding across all CRISP categories.",
        "Your certificate is being generated and will be available for download shortly.",
        "Consider sharing your achievement with colleagues and on professional networks.",
        "Explore advanced training sessions to further develop your skills.",
      ]
    : [
        "Focus on reviewing the areas where you scored below 70% before retaking.",
        "Review the course materials, especially focusing on your weaker CRISP categories.",
        "Practice applying the concepts through the interactive exercises provided.",
        "Consider scheduling additional training or consultation if available.",
      ];

  // const handleNavigate = (path: string, params?: Record<string, string>) => {
  //   switch (path) {
  //     case 'dashboard':
  //       navigate({ to: '/dashboard' });
  //       break;
  //     case 'session-detail':
  //       navigate({ to: '/sessions/$sessionId', params: { sessionId } });
  //       break;
  //     case 'session-retake':
  //       navigate({ to: '/sessions/$sessionId/quiz', params: { sessionId } });
  //       break;
  //     default:
  //       break;
  //   }
  // };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= passingScore) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getCategoryColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "[&>div]:bg-green-500";
    if (score >= 60) return "[&>div]:bg-yellow-500";
    return "[&>div]:bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="text-center">
        <div
          className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
            passed ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {passed ? (
            <Trophy className="w-10 h-10 text-green-600" />
          ) : (
            <XCircle className="w-10 h-10 text-red-600" />
          )}
        </div>

        <h1 className={passed ? "text-green-600" : "text-red-600"}>
          {passed ? "Congratulations!" : "Session Not Passed"}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          {passed
            ? "You have successfully completed this training session."
            : "You can review the material and retake the session to improve your score."}
        </p>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="pau-shadow">
          <CardContent className="p-6 text-center">
            <div
              className={`text-3xl font-bold mb-2 ${getScoreColor(finalScore)}`}
            >
              {finalScore.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Final Score</div>
            <div className="text-xs text-muted-foreground mt-1">
              {passingScore}% required to pass
            </div>
          </CardContent>
        </Card>

        <Card className="pau-shadow">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold mb-2 text-[#2e3f6f]">
              {completionTime}m
            </div>
            <div className="text-sm text-muted-foreground">Time Spent</div>
            <div className="text-xs text-muted-foreground mt-1">
              Session duration
            </div>
          </CardContent>
        </Card>

        <Card className="pau-shadow">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold mb-2 text-[#2e3f6f]">
              {passed ? "PASSED" : "FAILED"}
            </div>
            <div className="text-sm text-muted-foreground">Status</div>
            {certificateId && (
              <div className="text-xs text-muted-foreground mt-1">
                Certificate ID: {certificateId.slice(-8)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Results Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* CRISP Category Performance */}
          <Card className="pau-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-[#2e3f6f]" />
                CRISP Category Performance
              </CardTitle>
              <CardDescription>
                Your performance across different evaluation criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crispCategories.map((category) => (
                  <div key={category.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.label}</span>
                      <span
                        className={`font-medium ${getCategoryColor(category.score)}`}
                      >
                        {category.score.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={category.score}
                      className={`h-2 ${getProgressColor(category.score)}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Analysis */}
          <Card className="pau-shadow">
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Strengths */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {crispCategories
                      .filter((cat) => cat.score >= 80)
                      .map((category) => (
                        <li
                          key={category.key}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>
                            Excellent performance in{" "}
                            {category.label.toLowerCase()} (
                            {category.score.toFixed(1)}%)
                          </span>
                        </li>
                      ))}
                    {crispCategories.filter((cat) => cat.score >= 80).length ===
                      0 && (
                      <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span>
                          Focus on improving overall performance to identify
                          strengths
                        </span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-orange-600" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-2">
                    {crispCategories
                      .filter((cat) => cat.score < 70)
                      .map((category) => (
                        <li
                          key={category.key}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span>
                            Focus on {category.label.toLowerCase()} concepts and
                            practices ({category.score.toFixed(1)}%)
                          </span>
                        </li>
                      ))}
                    {crispCategories.filter((cat) => cat.score < 70).length ===
                      0 && (
                      <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>
                          All categories performed well - continue maintaining
                          this level
                        </span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-[#2e3f6f]" />
                    Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {recommendations.map((rec, index) => (
                      <li
                        key={index}
                        className="flex items-start space-x-2 text-sm"
                      >
                        <div className="w-2 h-2 bg-[#2e3f6f] rounded-full mt-2 flex-shrink-0"></div>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="pau-shadow">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Badge
                  className={`text-lg px-4 py-2 ${
                    passed
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {passed ? "PASSED" : "NOT PASSED"}
                </Badge>

                {passed ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      You've successfully completed this session and your
                      certificate is being generated.
                    </p>
                    {certificateId && (
                      <Button className="w-full pau-gradient">
                        <Award className="w-4 h-4 mr-2" />
                        View Certificate
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Review the material and try again to improve your score.
                    </p>
                    <Button
                      className="w-full pau-gradient"
                      //onClick={() => handleNavigate('session-retake')}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retake Session
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="pau-shadow">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                //onClick={() => handleNavigate('session-detail')}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Review Session Material
              </Button>

              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Download Results
              </Button>

              {passed && (
                <Button variant="outline" className="w-full justify-start">
                  <Share className="w-4 h-4 mr-2" />
                  Share Achievement
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full justify-start"
                //onClick={() => handleNavigate('dashboard')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="pau-shadow">
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              {passed ? (
                <div className="space-y-3">
                  {certificateId && (
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">
                          Certificate Being Generated
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {certificateId.slice(-12)}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Continue Learning</p>
                      <p className="text-xs text-muted-foreground">
                        Explore additional training sessions
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Review Required</p>
                      <p className="text-xs text-muted-foreground">
                        Focus on categories below 70%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Target Score</p>
                      <p className="text-xs text-muted-foreground">
                        {passingScore}% needed to pass
                      </p>
                    </div>
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
