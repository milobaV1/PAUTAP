import React, { useState } from "react";
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
  Award,
  TrendingUp,
  Calendar,
  Target,
  BookOpen,
  BarChart3,
  Play,
  Users,
  Heart,
  Shield,
  HandHeart,
  Briefcase,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface AssessmentsProps {
  onNavigate: (page: string, data?: any) => void;
}

export function Assessments() {
  const [selectedAssessment, setSelectedAssessment] = useState<number | null>(
    null
  );

  const navigate = useNavigate();

  const assessmentCategories = [
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

  const availableAssessments = [
    {
      id: 1,
      title: "Professional Ethics Assessment",
      description:
        "Comprehensive evaluation of professional ethics and standards",
      totalQuestions: 50,
      timeLimit: 90,
      attempts: 3,
      deadline: "2025-01-15",
      difficulty: "Intermediate",
      passingScore: 80,
      categories: assessmentCategories,
      questionsPerCategory: 10,
      progress: 0,
      status: "available",
    },
    {
      id: 2,
      title: "Leadership & Values Assessment",
      description: "Evaluation of leadership principles and core values",
      totalQuestions: 50,
      timeLimit: 75,
      attempts: 2,
      deadline: "2025-01-20",
      difficulty: "Advanced",
      passingScore: 85,
      categories: assessmentCategories,
      questionsPerCategory: 10,
      progress: 60,
      status: "in-progress",
    },
    {
      id: 3,
      title: "Community Service Evaluation",
      description: "Assessment of community engagement and service commitment",
      totalQuestions: 50,
      timeLimit: 60,
      attempts: 3,
      deadline: "2025-01-25",
      difficulty: "Beginner",
      passingScore: 75,
      categories: assessmentCategories,
      questionsPerCategory: 10,
      progress: 0,
      status: "available",
    },
  ];

  const completedAssessments = [
    {
      id: 4,
      title: "Institutional Values Assessment",
      score: 88,
      maxScore: 100,
      percentage: 88,
      completedDate: "2024-12-15",
      timeSpent: 65,
      totalQuestions: 50,
      correctAnswers: 44,
      difficulty: "Intermediate",
      status: "passed",
      categoryScores: [
        { category: "Community", score: 85, total: 10 },
        { category: "Respect", score: 95, total: 10 },
        { category: "Integrity", score: 80, total: 10 },
        { category: "Service", score: 90, total: 10 },
        { category: "Professionalism", score: 90, total: 10 },
      ],
    },
    {
      id: 5,
      title: "Professional Development Assessment",
      score: 72,
      maxScore: 100,
      percentage: 72,
      completedDate: "2024-12-10",
      timeSpent: 58,
      totalQuestions: 50,
      correctAnswers: 36,
      difficulty: "Beginner",
      status: "failed",
      categoryScores: [
        { category: "Community", score: 70, total: 10 },
        { category: "Respect", score: 80, total: 10 },
        { category: "Integrity", score: 65, total: 10 },
        { category: "Service", score: 75, total: 10 },
        { category: "Professionalism", score: 70, total: 10 },
      ],
    },
  ];

  const stats = {
    totalAvailable: availableAssessments.length,
    totalCompleted: completedAssessments.length,
    averageScore: Math.round(
      completedAssessments.reduce((acc, curr) => acc + curr.percentage, 0) /
        completedAssessments.length
    ),
    passRate: Math.round(
      (completedAssessments.filter((a) => a.status === "passed").length /
        completedAssessments.length) *
        100
    ),
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineColor = (days: number) => {
    if (days < 0) return "text-red-600";
    if (days <= 3) return "text-orange-600";
    if (days <= 7) return "text-yellow-600";
    return "text-green-600";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStartAssessment = (assessmentId: string) => {
    //onNavigate("assessment-taking", { assessmentId });--
    navigate({ to: "/assessment/$id", params: { id: assessmentId } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>Professional Assessments</h1>
          <p className="text-muted-foreground mt-1">
            Evaluate your understanding of professional values and ethics
            through comprehensive assessments
          </p>
        </div>
      </div>

      {/* Assessment Categories Overview */}
      <Card className="pau-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-[#2e3f6f]" />
            Assessment Categories
          </CardTitle>
          <CardDescription>
            Each assessment covers 5 core categories with 10 questions per
            category (50 total questions)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {assessmentCategories.map((category) => (
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
                <Badge variant="outline" className="mt-2">
                  10 Questions
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <Card className="pau-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Score
                </p>
                <p className="text-2xl font-bold mt-2">
                  {stats.averageScore || 0}%
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="pau-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pass Rate
                </p>
                <p className="text-2xl font-bold mt-2">
                  {stats.passRate || 0}%
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessment Tabs */}
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">
            Available Assessments ({availableAssessments.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedAssessments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {availableAssessments.map((assessment) => {
              const daysLeft = getDaysUntilDeadline(assessment.deadline);
              return (
                <Card
                  key={assessment.id}
                  className="pau-shadow hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          {assessment.title}
                        </CardTitle>
                        <CardDescription>
                          {assessment.description}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge
                          className={getDifficultyColor(assessment.difficulty)}
                        >
                          {assessment.difficulty}
                        </Badge>
                        <Badge className={getStatusColor(assessment.status)}>
                          {assessment.status === "in-progress"
                            ? "In Progress"
                            : "Available"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {assessment.progress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{assessment.progress}%</span>
                        </div>
                        <Progress value={assessment.progress} className="h-2" />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <FileCheck className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>{assessment.totalQuestions} questions</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>{assessment.timeLimit} minutes</span>
                      </div>
                      <div className="flex items-center">
                        <Target className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>{assessment.passingScore}% to pass</span>
                      </div>
                      <div className="flex items-center">
                        <Award className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>{assessment.attempts} attempts</span>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Deadline:</span>
                        <span
                          className={`text-sm font-medium ${getDeadlineColor(daysLeft)}`}
                        >
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {daysLeft < 0
                            ? `${Math.abs(daysLeft)} days overdue`
                            : daysLeft === 0
                              ? "Due today"
                              : `${daysLeft} days left`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Button variant="outline">View Details</Button>
                      <Button
                        className="pau-gradient"
                        onClick={() =>
                          handleStartAssessment(assessment.id.toString())
                        }
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {assessment.progress > 0
                          ? "Continue"
                          : "Start Assessment"}
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
            {completedAssessments.map((assessment) => (
              <Card key={assessment.id} className="pau-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{assessment.title}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={getDifficultyColor(assessment.difficulty)}
                        >
                          {assessment.difficulty}
                        </Badge>
                        <Badge
                          className={
                            assessment.status === "passed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {assessment.status === "passed" ? "Passed" : "Failed"}
                        </Badge>
                      </div>
                    </div>
                    <div
                      className={`text-3xl font-bold ${assessment.percentage >= 80 ? "text-green-600" : assessment.percentage >= 70 ? "text-blue-600" : "text-red-600"}`}
                    >
                      {assessment.percentage}%
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-900">
                        {assessment.correctAnswers}/{assessment.totalQuestions}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Correct Answers
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-900">
                        {assessment.timeSpent}m
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Time Spent
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-900">
                        {new Date(
                          assessment.completedDate
                        ).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Completed
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-900">
                        {assessment.categoryScores.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Categories
                      </div>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-3">Category Breakdown:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {assessment.categoryScores.map((catScore, index) => (
                        <div
                          key={index}
                          className="text-center p-3 border rounded-lg"
                        >
                          <div className="font-bold text-lg">
                            {Math.round(
                              (catScore.score / catScore.total) * 100
                            )}
                            %
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {catScore.category}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {catScore.score}/{catScore.total}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {assessment.status === "passed" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {assessment.status === "passed"
                          ? "Congratulations! You passed this assessment."
                          : "You can retake this assessment to improve your score."}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Detailed Results
                      </Button>
                      {assessment.status === "failed" && (
                        <Button size="sm" className="pau-gradient">
                          Retake Assessment
                        </Button>
                      )}
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
