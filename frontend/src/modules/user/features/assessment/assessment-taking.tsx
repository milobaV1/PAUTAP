import React, { useState, useEffect } from "react";
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
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Eye,
  RotateCcw,
} from "lucide-react";

interface AssessmentTakingProps {
  assessmentId: number;
  categoryId?: string;
  onNavigate: (page: string, data?: any) => void;
  completedCategories?: string[];
  categoryProgress?: {
    [key: string]: {
      completed: boolean;
      score: number;
      timeSpent: number;
      passed: boolean;
    };
  };
}

export function AssessmentTaking({
  assessmentId,
  categoryId,
  onNavigate,
  completedCategories = [],
  categoryProgress = {},
}: AssessmentTakingProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState(1080); // 18 minutes per category (90 min / 5 categories)
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showCategoryComplete, setShowCategoryComplete] = useState(false);
  const [categoryResults, setCategoryResults] = useState<{
    score: number;
    correctAnswers: number;
    passed: boolean;
    timeSpent: number;
    nextCategory?: string;
    isLastCategory: boolean;
    navigationData?: any;
  } | null>(null);

  // Assessment categories
  const categories = [
    {
      id: "community",
      name: "Community",
      icon: "👥",
      description: "Building and fostering community relationships",
    },
    {
      id: "respect",
      name: "Respect",
      icon: "❤️",
      description: "Demonstrating respect for diversity and individuals",
    },
    {
      id: "integrity",
      name: "Integrity",
      icon: "🛡️",
      description: "Upholding ethical standards and honesty",
    },
    {
      id: "service",
      name: "Service",
      icon: "🤝",
      description: "Commitment to serving others and the institution",
    },
    {
      id: "professionalism",
      name: "Professionalism",
      icon: "💼",
      description: "Maintaining professional conduct and excellence",
    },
  ];

  // Get current category info
  const currentCategory =
    categories.find((cat) => cat.id === categoryId) || categories[0];

  // Mock assessment data
  const assessment = {
    id: assessmentId,
    title: "Professional Ethics Assessment",
    categoryTitle: `${currentCategory.name} Assessment`,
    timeLimit: 18, // 18 minutes per category
    totalQuestions: 10, // 10 questions per category
    questionsPerCategory: 10,
  };

  // Generate questions for each category
  const generateQuestionsForCategory = (
    categoryName: string,
    startId: number
  ) => {
    const baseQuestions = {
      Community: [
        {
          question:
            "What is the most effective way to build a sense of community in a professional environment?",
          options: [
            "Focus only on individual achievements",
            "Encourage collaboration and mutual support",
            "Avoid team activities to prevent conflicts",
            "Limit communication between team members",
          ],
        },
        {
          question:
            "How should you respond when a colleague needs help with a project?",
          options: [
            "Ignore their request to focus on your own work",
            "Offer assistance while maintaining your own responsibilities",
            "Complete the entire project for them",
            "Refer them to someone else immediately",
          ],
        },
      ],
      Respect: [
        {
          question:
            "When working with colleagues from different cultural backgrounds, what is most important?",
          options: [
            "Expect everyone to follow your cultural norms",
            "Show genuine interest in understanding different perspectives",
            "Avoid discussing cultural differences",
            "Group people by their cultural backgrounds",
          ],
        },
        {
          question: "How should you handle a disagreement with a colleague?",
          options: [
            "Publicly criticize their ideas",
            "Listen actively and discuss differences respectfully",
            "Ignore their viewpoint completely",
            "Report them to management immediately",
          ],
        },
      ],
      Integrity: [
        {
          question:
            "What should you do if you discover a mistake in your work that affects others?",
          options: [
            "Hope no one notices and continue",
            "Acknowledge the mistake and work to correct it promptly",
            "Blame the mistake on external factors",
            "Wait for someone else to point it out",
          ],
        },
        {
          question:
            "When faced with pressure to compromise ethical standards, you should:",
          options: [
            "Go along with the pressure to avoid conflict",
            "Stand firm in your ethical principles",
            "Find a middle ground that satisfies everyone",
            "Delegate the decision to someone else",
          ],
        },
      ],
      Service: [
        {
          question:
            "What demonstrates a true commitment to service in your role?",
          options: [
            "Doing only what is required in your job description",
            "Going beyond expectations to benefit students and colleagues",
            "Focusing solely on personal career advancement",
            "Avoiding additional responsibilities",
          ],
        },
        {
          question: "How can you best serve the mission of your institution?",
          options: [
            "By promoting only your own department's interests",
            "By aligning your actions with institutional values and goals",
            "By competing with other departments for resources",
            "By focusing only on short-term gains",
          ],
        },
      ],
      Professionalism: [
        {
          question: "What is the hallmark of professional communication?",
          options: [
            "Using casual language in all situations",
            "Being clear, respectful, and appropriate to the context",
            "Avoiding difficult conversations",
            "Communicating only when absolutely necessary",
          ],
        },
        {
          question:
            "How should you handle confidential information in your role?",
          options: [
            "Share it freely with trusted colleagues",
            "Protect it according to institutional policies and ethical standards",
            "Use it to gain advantage in professional situations",
            "Assume all information can be shared publicly",
          ],
        },
      ],
    };

    const categoryQuestions =
      baseQuestions[categoryName as keyof typeof baseQuestions] || [];

    // Generate 10 questions for each category (repeat and modify base questions)
    const questions = [];
    for (let i = 0; i < 10; i++) {
      const baseQuestion = categoryQuestions[i % categoryQuestions.length];
      questions.push({
        id: startId + i,
        category: categoryName,
        question: `${baseQuestion.question} (Question ${i + 1} of 10 in ${categoryName})`,
        options: baseQuestion.options,
        type: "multiple-choice",
      });
    }

    return questions;
  };

  // Generate questions for the selected category only
  const questions = generateQuestionsForCategory(currentCategory.name, 0);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Auto-submit when time runs out
      handleSubmitAssessment();
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers({
      ...answers,
      [currentQuestion]: optionIndex,
    });
  };

  const handleFlagQuestion = () => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(currentQuestion)) {
      newFlagged.delete(currentQuestion);
    } else {
      newFlagged.add(currentQuestion);
    }
    setFlaggedQuestions(newFlagged);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleQuestionJump = (questionIndex: number) => {
    setCurrentQuestion(questionIndex);
  };

  const handleSubmitAssessment = () => {
    // Calculate score for this category
    const correctAnswers = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]; // Mock correct answers for 10 questions
    let score = 0;

    Object.entries(answers).forEach(([questionIndex, answer]) => {
      if (correctAnswers[parseInt(questionIndex)] === answer) {
        score++;
      }
    });

    const finalScore = Math.round((score / questions.length) * 100);
    const timeSpentMinutes = Math.round((1080 - timeLeft) / 60); // Convert to minutes
    const passed = finalScore >= 80;

    // Update completed categories and progress
    const updatedCompletedCategories = [...completedCategories];
    if (!updatedCompletedCategories.includes(categoryId || "")) {
      updatedCompletedCategories.push(categoryId || "");
    }

    const updatedProgress = {
      ...categoryProgress,
      [categoryId || ""]: {
        completed: true,
        score: finalScore,
        timeSpent: timeSpentMinutes,
        passed,
      },
    };

    // Determine next category
    const categoryOrder = [
      "community",
      "respect",
      "integrity",
      "service",
      "professionalism",
    ];
    const currentIndex = categoryOrder.indexOf(categoryId || "");
    const nextCategory =
      currentIndex < categoryOrder.length - 1
        ? categoryOrder[currentIndex + 1]
        : null;
    const isLastCategory = currentIndex === categoryOrder.length - 1;

    // Store results and show completion modal
    setCategoryResults({
      score: finalScore,
      correctAnswers: score,
      passed,
      timeSpent: timeSpentMinutes,
      nextCategory: nextCategory || undefined,
      isLastCategory,
    });

    // Update navigation data
    const updatedNavigationData = {
      assessmentId,
      categoryId,
      categoryName: currentCategory.name,
      score: finalScore,
      correctAnswers: score,
      totalQuestions: questions.length,
      timeSpent: timeSpentMinutes,
      answers,
      passed,
      completedCategories: updatedCompletedCategories,
      categoryProgress: updatedProgress,
    };

    setShowConfirmSubmit(false);
    setShowCategoryComplete(true);

    // Store the navigation data with results
    setCategoryResults((prev) => ({
      score: finalScore,
      correctAnswers: score,
      passed,
      timeSpent: timeSpentMinutes,
      nextCategory: nextCategory || undefined,
      isLastCategory,
      navigationData: updatedNavigationData,
    }));
  };

  const getTimeWarningColor = () => {
    if (timeLeft < 180) return "text-red-600"; // Less than 3 minutes
    if (timeLeft < 300) return "text-orange-600"; // Less than 5 minutes
    return "text-green-600";
  };

  const handleBackToCategories = () => {
    onNavigate("category-selection", {
      assessmentId,
      completedCategories,
      categoryProgress,
    });
  };

  const handleContinueToNext = () => {
    if (!categoryResults || !categoryResults.navigationData) return;

    const navigationData = categoryResults.navigationData;

    if (categoryResults.isLastCategory) {
      // Go to final results page
      onNavigate("assessment-results", navigationData);
    } else if (categoryResults.nextCategory) {
      // Go to next category
      onNavigate("assessment-taking", {
        ...navigationData,
        categoryId: categoryResults.nextCategory,
        categoryName: categories.find(
          (c) => c.id === categoryResults.nextCategory
        )?.name,
      });
    }
  };

  const handleBackToCategorySelection = () => {
    if (!categoryResults || !categoryResults.navigationData) return;

    const navigationData = categoryResults.navigationData;
    onNavigate("category-selection", navigationData);
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="font-semibold">{assessment.categoryTitle}</h2>
                <p className="text-sm text-muted-foreground">
                  {currentCategory.description}
                </p>
              </div>
              <Badge variant="outline">
                Question {currentQuestion + 1} of {questions.length}
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToCategories}
              >
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

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card className="pau-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-4">
                      {currentQ.question}
                    </CardTitle>
                  </div>
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
                {currentQ.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      answers[currentQuestion] === index
                        ? "border-[#2e3f6f] bg-[#e6f2ff]"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          answers[currentQuestion] === index
                            ? "border-[#2e3f6f] bg-[#2e3f6f]"
                            : "border-gray-300"
                        }`}
                      >
                        {answers[currentQuestion] === index && (
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

                {/* Navigation */}
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
                    {answers[currentQuestion] !== undefined ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {answers[currentQuestion] !== undefined
                        ? "Answered"
                        : "Not answered"}
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
            {/* Progress Summary */}
            <Card className="pau-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#2e3f6f]">
                      {answeredCount}/{questions.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Answered
                    </div>
                  </div>
                  <Progress
                    value={(answeredCount / questions.length) * 100}
                    className="h-2"
                  />
                  <div className="text-center text-sm text-muted-foreground">
                    {questions.length - answeredCount} remaining
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question Navigator */}
            <Card className="pau-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Questions</CardTitle>
                <CardDescription>Click to jump to any question</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className={`relative ${
                        index === currentQuestion
                          ? "bg-[#2e3f6f] text-white border-[#2e3f6f]"
                          : answers[index] !== undefined
                            ? "bg-green-100 border-green-300 text-green-800"
                            : flaggedQuestions.has(index)
                              ? "bg-orange-100 border-orange-300 text-orange-800"
                              : ""
                      }`}
                      onClick={() => handleQuestionJump(index)}
                    >
                      {index + 1}
                      {flaggedQuestions.has(index) && (
                        <Flag className="w-3 h-3 absolute -top-1 -right-1 fill-current text-orange-600" />
                      )}
                    </Button>
                  ))}
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[#2e3f6f] rounded"></div>
                    <span>Current question</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
                    <span>Flagged</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Review Summary */}
            <Card className="pau-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Answered</span>
                  <span className="font-medium">{answeredCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Flagged</span>
                  <span className="font-medium">{flaggedQuestions.size}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Remaining</span>
                  <span className="font-medium">
                    {questions.length - answeredCount}
                  </span>
                </div>

                {flaggedQuestions.size > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => {
                      const firstFlagged = Math.min(
                        ...Array.from(flaggedQuestions)
                      );
                      setCurrentQuestion(firstFlagged);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Review Flagged
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirm Submit Dialog */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                Submit Category?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p>
                  Are you sure you want to submit your {currentCategory.name}{" "}
                  assessment?
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    • Answered: {answeredCount}/{questions.length} questions
                  </p>
                  <p>• Time remaining: {formatTime(timeLeft)}</p>
                  <p>• You cannot change answers after submitting</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowConfirmSubmit(false)}
                >
                  Continue Assessment
                </Button>
                <Button
                  className="flex-1 pau-gradient"
                  onClick={handleSubmitAssessment}
                >
                  Submit Category
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Complete Dialog */}
      {showCategoryComplete && categoryResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                {currentCategory.name} Category Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Completion Message */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-medium">Great work!</p>
                <p className="text-muted-foreground">
                  You have successfully completed the {currentCategory.name}{" "}
                  category. Your responses have been saved.
                </p>
              </div>

              {/* Next Steps */}
              <div className="space-y-3">
                {categoryResults.isLastCategory ? (
                  <div className="text-center space-y-2 p-4 bg-blue-50 rounded-lg">
                    <p className="font-medium text-[#2e3f6f]">
                      🎉 All Categories Complete!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You have completed all 5 categories. View your
                      comprehensive results and certificate.
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-2 p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium">What's next?</p>
                    <p className="text-sm text-muted-foreground">
                      Continue to the next category:{" "}
                      <span className="font-medium">
                        {
                          categories.find(
                            (c) => c.id === categoryResults.nextCategory
                          )?.name
                        }
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleBackToCategorySelection}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Categories
                </Button>
                <Button
                  className="flex-1 pau-gradient"
                  onClick={handleContinueToNext}
                >
                  {categoryResults.isLastCategory ? (
                    <>
                      View Results
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Continue to Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
