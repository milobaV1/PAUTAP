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
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Trophy,
  Award,
  TrendingUp,
  Clock,
  Users,
  Target,
  Calendar,
  ChevronRight,
  Star,
} from "lucide-react";

export function Home() {
  const stats = [
    {
      title: "Courses Completed",
      value: "12",
      change: "+2 this month",
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      title: "Total Learning Hours",
      value: "48.5",
      change: "+12.5 hours",
      icon: Clock,
      color: "text-green-600",
    },
    {
      title: "Certificates Earned",
      value: "8",
      change: "+3 new",
      icon: Award,
      color: "text-purple-600",
    },
    {
      title: "Trivia Score",
      value: "2,450",
      change: "+150 points",
      icon: Trophy,
      color: "text-yellow-600",
    },
  ];

  const upcomingCourses = [
    {
      title: "Advanced Classroom Management",
      duration: "3 hours",
      deadline: "Due in 5 days",
      progress: 0,
      instructor: "Dr. Sarah Johnson",
    },
    {
      title: "Educational Technology Integration",
      duration: "2.5 hours",
      deadline: "Due in 10 days",
      progress: 25,
      instructor: "Prof. Michael Chen",
    },
    {
      title: "Student session Strategies",
      duration: "4 hours",
      deadline: "Due in 15 days",
      progress: 60,
      instructor: "Dr. Emily Rodriguez",
    },
  ];

  const achievements = [
    { name: "Quick Learner", icon: "⚡", earned: true },
    { name: "Knowledge Seeker", icon: "🔍", earned: true },
    { name: "Team Player", icon: "🤝", earned: true },
    { name: "Innovation Leader", icon: "💡", earned: true },
    { name: "Perfect Score", icon: "🎯", earned: false },
    { name: "Mentor", icon: "👨‍🏫", earned: false },
  ];

  const navigate = useNavigate();

  const handleNavigation = (to: string) => {
    navigate({ to });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Welcome back, Michael!</h1>
          <p className="text-muted-foreground mt-1">
            Continue your professional development journey
          </p>
        </div>
        {/* <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-[#e6f2ff] text-[#2e3f6f]">
            <Star className="w-3 h-3 mr-1" />
            Level 5 Educator
          </Badge>
        </div> */}
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Learning Progress */}
        <div className="lg:col-span-3 space-y-6">
          {/* Current Progress */}
          <Card className="pau-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-[#2e3f6f]" />
                Learning Progress
              </CardTitle>
              <CardDescription>
                Your ongoing courses and progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingCourses.map((course, index) => (
                <div key={index} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{course.title}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {course.duration}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {course.deadline}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavigation("/program")}
                    >
                      Continue
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleNavigation("/program")}
              >
                View All Modules
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          {/* <Card className="pau-shadow">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest learning achievements
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
                      {activity.type === "course" && (
                        <BookOpen className="w-5 h-5 text-[#2e3f6f]" />
                      )}
                      {activity.type === "achievement" && (
                        <Award className="w-5 h-5 text-[#2e3f6f]" />
                      )}
                      {activity.type === "trivia" && (
                        <Trophy className="w-5 h-5 text-[#2e3f6f]" />
                      )}
                      {activity.type === "session" && (
                        <Target className="w-5 h-5 text-[#2e3f6f]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      +{activity.points} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}
        </div>

        {/* Sidebar */}
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
                onClick={() => handleNavigation("/trivia")}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Take Monthly Trivia
              </Button>
              {/* <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleNavigation("/sessions")}
              >
                <Target className="w-4 h-4 mr-2" />
                Pending sessions
              </Button> */}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleNavigation("/certificates")}
              >
                <Award className="w-4 h-4 mr-2" />
                Download Certificates
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleNavigation("/program")}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Browse Modules
              </Button>
            </CardContent>
          </Card>

          {/* Learning Resources */}
          <Card className="pau-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-[#2e3f6f]" />
                Course Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground mb-3">
                Reference materials used in our professional development courses
              </div>

              <div className="space-y-3">
                <div className="border-l-4 border-[#2e3f6f] pl-4">
                  <h4 className="font-medium text-sm">
                    Nature of Human Beings
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Foundational Understanding of Human Nature
                  </p>
                  <p className="text-xs text-[#2e3f6f]">
                    Author: Juan Manuel Elegido
                  </p>
                </div>

                <div className="border-l-4 border-[#2e3f6f] pl-4">
                  <h4 className="font-medium text-sm">
                    Introduction to Ethics
                  </h4>
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
                  Access additional resources through your course materials and
                  the PAU library portal.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
