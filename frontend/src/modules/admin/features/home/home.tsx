import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Target,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useGetAdminDashboard } from "./api/get-dashboard-stats";
import { useNavigate } from "@tanstack/react-router";

export function AdminHome() {
  const [page, setPage] = useState(1);
  const limit = 5;
  const { data: dashboardData, isLoading } = useGetAdminDashboard(page, limit);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center h-64">
        Error loading dashboard data
      </div>
    );
  }

  const totalPages = Math.ceil(
    dashboardData.totalSessions / dashboardData.limit
  );

  const stats = [
    {
      title: "Total Users",
      value: dashboardData.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Sessions",
      value: dashboardData.totalSessions.toString(),
      icon: BookOpen,
      color: "text-green-600",
    },
    {
      title: "Certificates Issued",
      value: dashboardData.totalCertificatesIssued.toLocaleString(),
      icon: Award,
      color: "text-purple-600",
    },
    {
      title: "Overall Completion Rate",
      value: `${dashboardData.overallCompletionRate}%`,
      icon: TrendingUp,
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your professional learning platform
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="pau-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session Performance Overview */}
        <div className="lg:col-span-2">
          <Card className="pau-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-[#2e3f6f]" />
                Session Performance Overview
              </CardTitle>
              <CardDescription>
                Training sessions and their completion metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.sessions.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.sessions.map((session) => (
                    <div key={session.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{session.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {session.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span>{session.totalEnrolled} enrolled</span>
                            <span>{session.totalCompleted} completed</span>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`${
                            session.completionRate >= 80
                              ? "bg-green-100 text-green-800"
                              : session.completionRate >= 60
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {session.completionRate >= 80
                            ? "High Performance"
                            : session.completionRate >= 60
                              ? "Moderate Performance"
                              : "Needs Attention"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Completion Rate</span>
                          <span>{session.completionRate}%</span>
                        </div>
                        <Progress
                          value={session.completionRate}
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No training sessions available
                </div>
              )}
              {/* Pagination controls */}
              <div className="flex justify-between items-center mt-6">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                  Page {dashboardData.page} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card className="pau-shadow">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate({ to: "/admin/user" })}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate({ to: "/admin/question" })}
              >
                <Target className="w-4 h-4 mr-2" />
                Manage Questions
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate({ to: "/admin/session" })}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Manage Sessions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
