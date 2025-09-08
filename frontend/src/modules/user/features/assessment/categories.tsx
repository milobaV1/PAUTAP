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
import {
  ChevronLeft,
  Play,
  CheckCircle,
  Clock,
  Target,
  Users,
  Heart,
  Shield,
  HandHeart,
  Briefcase,
  Award,
  FileCheck,
} from "lucide-react";
import { Route } from "@/routes/(user)/_layout/assessment/$id";

// interface CategorySelectionProps {
//   assessmentId: number;
//   onNavigate: (page: string, data?: any) => void;
//   categoryProgress?: {
//     [key: string]: {
//       completed: boolean;
//       score: number;
//       timeSpent: number;
//       passed: boolean;
//     };
//   };
// }

export function CategorySelection() {
  // Mock assessment data
  const assessmentId = Route.useParams();
  const assessment = {
    id: assessmentId,
    title: "Professional Ethics Assessment",
    description:
      "Comprehensive evaluation of professional ethics and standards",
    totalQuestions: 50,
    timeLimit: 90,
    questionsPerCategory: 10,
    passingScore: 80,
  };

  // Assessment categories with progress tracking
  const categoryProgress =
    //propCategoryProgress ||
    {
      community: { completed: false, score: 0, timeSpent: 0, passed: false },
      respect: { completed: false, score: 0, timeSpent: 0, passed: false },
      integrity: { completed: false, score: 0, timeSpent: 0, passed: false },
      service: { completed: false, score: 0, timeSpent: 0, passed: false },
      professionalism: {
        completed: false,
        score: 0,
        timeSpent: 0,
        passed: false,
      },
    };

  const categories = [
    {
      id: "community",
      name: "Community",
      icon: Users,
      color: "bg-blue-100 text-blue-800 border-blue-200",
      hoverColor: "hover:bg-blue-50 hover:border-blue-300",
      description: "Building and fostering community relationships",
      details:
        "Explore how to create inclusive environments, collaborate effectively, and support colleagues in achieving common goals.",
    },
    {
      id: "respect",
      name: "Respect",
      icon: Heart,
      color: "bg-green-100 text-green-800 border-green-200",
      hoverColor: "hover:bg-green-50 hover:border-green-300",
      description: "Demonstrating respect for diversity and individuals",
      details:
        "Learn about cultural competency, inclusive communication, and creating respectful workplace interactions.",
    },
    {
      id: "integrity",
      name: "Integrity",
      icon: Shield,
      color: "bg-purple-100 text-purple-800 border-purple-200",
      hoverColor: "hover:bg-purple-50 hover:border-purple-300",
      description: "Upholding ethical standards and honesty",
      details:
        "Understand ethical decision-making, transparency in actions, and maintaining trust through consistent behavior.",
    },
    {
      id: "service",
      name: "Service",
      icon: HandHeart,
      color: "bg-orange-100 text-orange-800 border-orange-200",
      hoverColor: "hover:bg-orange-50 hover:border-orange-300",
      description: "Commitment to serving others and the institution",
      details:
        "Explore dedication to student success, institutional mission, and going beyond expectations to serve others.",
    },
    {
      id: "professionalism",
      name: "Professionalism",
      icon: Briefcase,
      color: "bg-indigo-100 text-indigo-800 border-indigo-200",
      hoverColor: "hover:bg-indigo-50 hover:border-indigo-300",
      description: "Maintaining professional conduct and excellence",
      details:
        "Learn about professional communication, workplace etiquette, and maintaining high standards in all interactions.",
    },
  ];

  const completedCategories = Object.values(categoryProgress).filter(
    (p) => p.completed
  ).length;
  const overallProgress = (completedCategories / categories.length) * 100;

  const handleStartCategory = (categoryId: string) => {
    // onNavigate("assessment-taking", {
    //   assessmentId,
    //   categoryId,
    //   categoryName: categories.find((c) => c.id === categoryId)?.name,
    //   completedCategories: Object.keys(categoryProgress).filter(
    //     (id) => categoryProgress[id]?.completed
    //   ),
    //   categoryProgress,
    // });
  };

  const handleBackToAssessments = () => {
    //onNavigate("assessments");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleBackToAssessments}
          className="mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Assessments
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Assessment Overview */}
        <Card className="pau-shadow mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">
                  {assessment.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {assessment.description}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-sm">
                {assessment.totalQuestions} Questions Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Assessment Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <FileCheck className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="font-semibold">
                  {assessment.questionsPerCategory}
                </div>
                <div className="text-sm text-muted-foreground">
                  Questions per Category
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="font-semibold">
                  {Math.round(assessment.timeLimit / 5)} min
                </div>
                <div className="text-sm text-muted-foreground">
                  Per Category
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="font-semibold">{assessment.passingScore}%</div>
                <div className="text-sm text-muted-foreground">
                  Passing Score
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="font-semibold">{categories.length}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
            </div>

            {/* Overall Progress */}
            {completedCategories > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Overall Progress</h3>
                  <span className="text-sm text-muted-foreground">
                    {completedCategories} of {categories.length} completed
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
              Complete each category at your own pace. You can switch between
              categories after finishing one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            {categories.map((category, index) => {
              const isCompleted =
                categoryProgress[category.id as keyof typeof categoryProgress]
                  ?.completed;
              const CategoryIcon = category.icon;

              return (
                <Card
                  key={category.id}
                  className={`pau-shadow transition-all duration-200 border-2 ${category.hoverColor} ${
                    isCompleted ? "bg-green-50 border-green-200" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Category Icon */}
                      <div
                        className={`p-3 rounded-full ${category.color.replace("text-", "bg-").replace("800", "200")} ${
                          isCompleted ? "bg-green-200" : ""
                        }`}
                      >
                        <CategoryIcon
                          className={`w-6 h-6 ${
                            isCompleted
                              ? "text-green-700"
                              : category.color.includes("text-")
                                ? category.color
                                : "text-gray-600"
                          }`}
                        />
                      </div>

                      {/* Category Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">
                            {category.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Badge className={category.color}>
                              {assessment.questionsPerCategory} Questions
                            </Badge>
                            {isCompleted && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-3">
                          {category.description}
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          {category.details}
                        </p>

                        {/* Progress for completed categories */}
                        {isCompleted && (
                          <div className="flex items-center justify-between text-sm mb-4 p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center space-x-4">
                              <span className="font-medium">
                                Score:{" "}
                                {
                                  categoryProgress[
                                    category.id as keyof typeof categoryProgress
                                  ]?.score
                                }
                                %
                              </span>
                              <span>
                                Time:{" "}
                                {
                                  categoryProgress[
                                    category.id as keyof typeof categoryProgress
                                  ]?.timeSpent
                                }
                                m
                              </span>
                            </div>
                            <Badge
                              className={`${
                                categoryProgress[
                                  category.id as keyof typeof categoryProgress
                                ]?.passed
                                  ? "bg-green-100 text-green-800"
                                  : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {categoryProgress[
                                category.id as keyof typeof categoryProgress
                              ]?.passed
                                ? "Passed"
                                : "Needs Improvement"}
                            </Badge>
                          </div>
                        )}

                        {/* Action Button */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Estimated time:{" "}
                            {Math.round(assessment.timeLimit / 5)} minutes
                          </div>
                          <Button
                            onClick={() => handleStartCategory(category.id)}
                            className={`pau-gradient ${isCompleted ? "opacity-75" : ""}`}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {isCompleted ? "Retake Category" : "Start Category"}
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

        {/* Instructions */}
        <Card className="pau-shadow mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="font-medium">• Select any category to begin</p>
                <p className="font-medium">
                  • Complete questions at your own pace
                </p>
                <p className="font-medium">
                  • Review and flag questions as needed
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">
                  • Return to this page after each category
                </p>
                <p className="font-medium">
                  • Complete all 5 categories for full certification
                </p>
                <p className="font-medium">
                  • Achieve {assessment.passingScore}% or higher in each
                  category
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
