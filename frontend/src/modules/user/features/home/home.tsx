import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Trophy, Award } from "lucide-react";
import { useGetDashboard } from "./api/get-dashboard";
import { useAuthState } from "@/store/auth.store";

export function Home() {
  const navigate = useNavigate();
  const { decodedDto } = useAuthState();

  const userId = decodedDto?.sub.id;
  const { data, isLoading } = useGetDashboard(userId ?? "");

  const handleNavigation = (to: string) => {
    navigate({ to });
  };

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  if (!data) {
    return <div>No dashboard data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Welcome back, {data.user.name}!</h1>
          <p className="text-muted-foreground mt-1">
            Continue your professional development journey
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="pau-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Courses Completed
                </p>
                <p className="text-2xl font-bold mt-2">
                  {data.completedSessions}
                </p>
              </div>
              <div className="p-3 rounded-full bg-gray-100 text-blue-600">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="pau-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Trivia Score
                </p>
                <p className="text-2xl font-bold mt-2">{data.triviaScore}</p>
              </div>
              <div className="p-3 rounded-full bg-gray-100 text-yellow-600">
                <Trophy className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="pau-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Certificates Earned
                </p>
                <p className="text-2xl font-bold mt-2">
                  {data.certificatesCount}
                </p>
              </div>
              <div className="p-3 rounded-full bg-gray-100 text-purple-600">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Learning Resources */}
        <Card className="pau-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-[#2e3f6f]" />
              Session Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground mb-3">
              Reference materials used in our professional development courses
            </div>

            <div className="space-y-3">
              <div className="border-l-4 border-[#2e3f6f] pl-4">
                <h4 className="font-medium text-sm">Nature of Human Beings</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Foundational Understanding of Human Nature
                </p>
                <p className="text-xs text-[#2e3f6f]">
                  Author: Juan Manuel Elegido
                </p>
              </div>

              <div className="border-l-4 border-[#2e3f6f] pl-4">
                <h4 className="font-medium text-sm">Introduction to Ethics</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Fundamental Principles of Ethical Reasoning
                </p>
                <p className="text-xs text-[#2e3f6f]">
                  Author: Juan Manuel Elegido
                </p>
              </div>

              <div className="border-l-4 border-[#2e3f6f] pl-4">
                <h4 className="font-medium text-sm">
                  PAU Staff Code of Conduct
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Professional Standards and Guidelines
                </p>
                <p className="text-xs text-[#2e3f6f]">Author: PAU</p>
              </div>
            </div>

            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                Access additional resources through the PAU library portal.
              </p>
            </div>
          </CardContent>
        </Card>
        {/* Sidebar - Quick Actions */}

        <Card className="pau-shadow">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Continue your journey with these options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleNavigation("/trivia")}
            >
              <Trophy className="w-4 h-4 mr-2" />
              Take Monthly Trivia
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleNavigation("/certificate")}
            >
              <Award className="w-4 h-4 mr-2" />
              Download Certificates
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleNavigation("/session")}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Sessions
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
