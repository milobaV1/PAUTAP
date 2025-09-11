import React from "react";
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
} from "lucide-react";
import { Route } from "@/routes/(user)/_layout/session/$id";
import { useSessionStore } from "@/store/session.store";
import type { UsersessionData } from "@/service/interfaces/session.interface";
import { CRISP } from "@/service/enums/crisp.enum";
import { useNavigate } from "@tanstack/react-router";

export function CategorySelection() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const sessions = useSessionStore((state) => state.sessions);
  console.log("Sessions from the store: ", sessions);
  const session = sessions.find((s) => String(s.sessionId) === String(id)) as
    | UsersessionData
    | undefined;

  if (!session) {
    return <div className="p-6">Loading session...</div>;
  }

  const CRISP_ORDER: CRISP[] = [CRISP.C, CRISP.R, CRISP.I, CRISP.S, CRISP.P];

  const categories = session.categories || [];
  const sortedCategories = [...categories].sort(
    (a, b) => CRISP_ORDER.indexOf(a.category) - CRISP_ORDER.indexOf(b.category)
  );

  const handleStartCategory = (categoryId: string) => {
    console.log("Start category", categoryId);
    // navigate to category-taking page here
    navigate({
      to: "/session/$id/category/$categoryId",
      params: { id, categoryId },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="mb-4">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to sessions
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Session Overview */}
        <Card className="pau-shadow mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">
                  {session.sessionTitle}
                </CardTitle>
                <CardDescription className="text-base">
                  {session.sessionDescription}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-sm">
                {session.totalQuestionsAvailable} Questions
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
                  {session.startedAt ? "In Progress" : "Not Started"}
                </div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
              <div className="text-center">
                <Target className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                <div className="font-semibold">
                  {session.accuracyPercentage ?? 0}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center">
                <Award className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                <div className="font-semibold">
                  {session.progressPercentage ?? 0}%
                </div>
                <div className="text-sm text-muted-foreground">Progress</div>
              </div>
            </div>

            {/* Overall Progress */}
            {session.progressPercentage > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Overall Progress</h3>
                  <span className="text-sm text-muted-foreground">
                    {session.progressPercentage}% completed
                  </span>
                </div>
                <Progress value={session.progressPercentage} className="h-3" />
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
              Complete each category at your own pace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            {sortedCategories.map((category) => {
              const isCompleted =
                category.userAnswers.length === category.questionsCount;

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
                        <div className="flex items-center justify-between text-sm mb-4 p-3 bg-gray-50 rounded-md">
                          <span>
                            Answered: {category.userAnswers.length} /{" "}
                            {category.questionsCount}
                          </span>
                        </div>

                        {/* Action */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Difficulty: {session.sessionDifficulty}
                          </div>
                          <Button
                            onClick={() =>
                              handleStartCategory(
                                category.categoryId.toString()
                              )
                            }
                            className={`pau-gradient ${isCompleted ? "opacity-75" : ""}`}
                            disabled={isCompleted}
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
      </div>
    </div>
  );
}
