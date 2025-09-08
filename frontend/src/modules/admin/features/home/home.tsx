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
  UserPlus,
  Plus,
  Eye,
  Settings,
  CheckCircle,
  Clock,
  Target,
  Calendar,
} from "lucide-react";

export function AdminHome() {
  const stats = [
    {
      title: "Total Users",
      value: "1,247",
      change: "+12% from last month",
      icon: Users,
      color: "text-blue-600",
      trend: "up",
    },
    {
      title: "Active Courses",
      value: "28",
      change: "+3 new this month",
      icon: BookOpen,
      color: "text-green-600",
      trend: "up",
    },
    {
      title: "Certificates Issued",
      value: "3,891",
      change: "+156 this month",
      icon: Award,
      color: "text-purple-600",
      trend: "up",
    },
    {
      title: "Completion Rate",
      value: "87.3%",
      change: "+2.1% improvement",
      icon: TrendingUp,
      color: "text-yellow-600",
      trend: "up",
    },
  ];

  const recentActivities = [
    {
      user: "Dr. Sarah Johnson",
      action: "completed Digital Teaching Methods",
      time: "2 hours ago",
      type: "completion",
    },
    {
      user: "Prof. Michael Chen",
      action: "enrolled in Educational Leadership",
      time: "4 hours ago",
      type: "enrollment",
    },
    {
      user: "Admin",
      action: "created new course: Research Methods",
      time: "1 day ago",
      type: "course",
    },
    {
      user: "Dr. Emily Rodriguez",
      action: "earned Assessment Expert badge",
      time: "2 days ago",
      type: "achievement",
    },
    {
      user: "System",
      action: "Monthly trivia results published",
      time: "3 days ago",
      type: "system",
    },
  ];

  const courseOverview = [
    {
      title: "Digital Teaching Methods",
      enrollments: 245,
      completions: 198,
      rating: 4.8,
      status: "active",
    },
    {
      title: "Educational Leadership",
      enrollments: 98,
      completions: 76,
      rating: 4.9,
      status: "active",
    },
    {
      title: "Assessment Strategies",
      enrollments: 156,
      completions: 124,
      rating: 4.6,
      status: "active",
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
        <div className="flex items-center space-x-3">
          <Button
            className="pau-gradient"
            //onClick={() => onNavigate("user-management")}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
          <Button
            className="pau-gradient"
            //onClick={() => onNavigate("course-management")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Course
          </Button>
          <Button
            className="pau-gradient"
            //onClick={() => onNavigate("question-management")}
          >
            <Target className="w-4 h-4 mr-2" />
            Add Questions
          </Button>
          <Button
            className="pau-gradient"
            //onClick={() => onNavigate("training-session-management")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Create Training Session
          </Button>
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
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
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
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="pau-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-[#2e3f6f]" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest platform activities and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-3 border rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#e6f2ff] flex items-center justify-center">
                      {activity.type === "completion" && (
                        <CheckCircle className="w-5 h-5 text-[#2e3f6f]" />
                      )}
                      {activity.type === "enrollment" && (
                        <UserPlus className="w-5 h-5 text-[#2e3f6f]" />
                      )}
                      {activity.type === "course" && (
                        <BookOpen className="w-5 h-5 text-[#2e3f6f]" />
                      )}
                      {activity.type === "achievement" && (
                        <Award className="w-5 h-5 text-[#2e3f6f]" />
                      )}
                      {activity.type === "system" && (
                        <Settings className="w-5 h-5 text-[#2e3f6f]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.user}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.action}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                // onClick={() => onNavigate("activity-logs")}
              >
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Additional Tools */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="pau-shadow">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                //onClick={() => onNavigate("user-management")}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                // onClick={() => onNavigate("course-management")}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Manage Courses
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                //onClick={() => onNavigate("question-management")}
              >
                <Target className="w-4 h-4 mr-2" />
                Manage Questions
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                //onClick={() => onNavigate("training-session-management")}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Training Sessions
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                //onClick={() => onNavigate("reports")}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Reports
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                //onClick={() => onNavigate("admin-settings")}
              >
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Course Overview */}
      <Card className="pau-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-[#2e3f6f]" />
            Course Performance Overview
          </CardTitle>
          <CardDescription>
            Top performing courses and their metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courseOverview.map((course, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{course.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <span>{course.enrollments} enrolled</span>
                      <span>Rating: {course.rating}/5</span>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    {course.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion Rate</span>
                    <span>
                      {Math.round(
                        (course.completions / course.enrollments) * 100
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={(course.completions / course.enrollments) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full mt-4"
            //onClick={() => onNavigate("course-management")}
          >
            <Eye className="w-4 h-4 mr-2" />
            View All Courses
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
