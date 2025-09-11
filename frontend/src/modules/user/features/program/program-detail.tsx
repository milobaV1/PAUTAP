import React, { useState } from "react";

import {
  Play,
  Clock,
  Users,
  Star,
  BookOpen,
  CheckCircle,
  Lock,
  FileText,
  Video,
  Headphones,
  Download,
  Share,
  ChevronLeft,
  Target,
  Award,
  Calendar,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Route } from "@/routes/(user)/_layout/program/$id";
import { useNavigate } from "@tanstack/react-router";

export function ModuleDetail() {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const { id } = Route.useParams();
  const navigate = useNavigate();

  // Mock module data - in real app this would come from props or API
  const module = {
    id: id,
    title: "Digital Teaching Excellence",
    description:
      "Master digital tools and online teaching strategies for modern education. This comprehensive module covers everything from basic digital literacy to advanced online pedagogy techniques through 5 comprehensive courses.",
    level: "Intermediate",
    rating: 4.8,
    students: 245,
    progress: 40,
    status: "in_progress",
    skills: [
      "Digital Pedagogy",
      "Online Learning",
      "Educational Technology",
      "Student Engagement",
    ],
    completedCourses: 2,
    totalCourses: 5,
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=300&fit=crop",
  };

  const courses = [
    {
      id: 1,
      title: "Introduction to Digital Teaching",
      description:
        "Foundation concepts and overview of digital teaching methods",
      duration: "45 min",
      lessons: 3,
      completed: true,
      locked: false,
      hassession: true,
      sessionCompleted: true,
      sessionScore: 85,
    },
    {
      id: 2,
      title: "Digital Classroom Setup",
      description:
        "Essential tools and platforms for creating an effective online learning environment",
      duration: "50 min",
      lessons: 4,
      completed: true,
      locked: false,
      hassession: true,
      sessionCompleted: true,
      sessionScore: 92,
    },
    {
      id: 3,
      title: "Interactive Content Creation",
      description:
        "Learn to create engaging multimedia content for your students",
      duration: "60 min",
      lessons: 5,
      completed: false,
      locked: false,
      current: true,
      hassession: true,
      sessionCompleted: false,
    },
    {
      id: 4,
      title: "Student Engagement Online",
      description:
        "Techniques to keep students engaged in virtual learning environments",
      duration: "55 min",
      lessons: 4,
      completed: false,
      locked: false,
      hassession: true,
      sessionCompleted: false,
    },
    {
      id: 5,
      title: "Advanced Digital Pedagogy",
      description:
        "Advanced strategies and emerging technologies in digital education",
      duration: "65 min",
      lessons: 6,
      completed: false,
      locked: false,
      hassession: true,
      sessionCompleted: false,
    },
  ];

  const getContentIcon = (type: string) => {
    switch (type) {
      case "article":
        return <FileText className="w-4 h-4" />;
      case "reading":
        return <BookOpen className="w-4 h-4" />;
      case "interactive":
        return <Target className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  // const handleLessonClick = (lessonId: number) => {
  //   const lesson = lessons.find((l) => l.id === lessonId);
  //   if (lesson && !lesson.locked) {
  //     onNavigate("lesson", { courseId: moduleId, lessonId: lessonId });
  //   }
  // };

  const handleContinueLearning = () => {
    const currentCourse =
      courses.find((c) => c.current) || courses.find((c) => !c.completed);
    if (currentCourse) {
      //onNavigate("lesson", { courseId: currentCourse.id, lessonId: 1 });
      navigate({
        to: "/program/$id/course/$courseId",
        params: { id, courseId: String(1) },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Button
        variant="ghost"
        // onClick={() => onNavigate("modules")}
        className="mb-4"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to Learning Modules
      </Button>

      {/* Course Header */}
      <div className="relative">
        <div className="h-48 md:h-64 rounded-lg overflow-hidden">
          <img
            src={module.image}
            alt={module.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
            <div className="p-6 text-white">
              <h1 className="text-3xl font-bold mb-2 text-white">
                {module.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {module.students} students
                </span>
                <span className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {module.totalCourses} courses
                </span>
                {/* <span className="flex items-center">
                  <Star className="w-4 h-4 mr-1 fill-current text-yellow-400" />
                  {module.rating}
                </span> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Card */}
          <Card className="pau-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Your Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    {module.completedCourses} of {module.totalCourses} courses
                    completed
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#2e3f6f]">
                    {module.progress}%
                  </div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
              </div>
              <Progress value={module.progress} className="h-3 mb-4" />
              <Button
                className="w-full pau-gradient"
                onClick={handleContinueLearning}
              >
                <Play className="w-4 h-4 mr-2" />
                Continue Learning
              </Button>
            </CardContent>
          </Card>

          {/* Course Content Tabs */}
          <Tabs defaultValue="curriculum" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {/* <TabsTrigger value="reviews">Reviews</TabsTrigger> */}
            </TabsList>

            <TabsContent value="curriculum" className="space-y-4 mt-6">
              <Card className="pau-shadow">
                <CardHeader>
                  <CardTitle>Module Curriculum</CardTitle>
                  <CardDescription>
                    {module.totalCourses} courses • Each course includes lessons
                    and an session
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Course Flow Information */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">
                          Course Flow
                        </h4>
                        <p className="text-sm text-blue-700">
                          Complete all lessons in a course to unlock its
                          session. sessions become available after finishing the
                          final lesson of each course.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {courses.map((course, index) => (
                      <div
                        key={course.id}
                        className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-all ${
                          course.locked
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:shadow-md hover:border-[#2e3f6f]"
                        } ${course.current ? "border-[#2e3f6f] bg-[#e6f2ff]" : ""}`}
                        onClick={() =>
                          !course.locked &&
                          navigate({
                            to: "/program/$id/course/$courseId",
                            params: { id, courseId: String(course.id) },
                          })
                        }
                      >
                        <div className="flex-shrink-0">
                          {course.completed ? (
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                          ) : course.locked ? (
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <Lock className="w-5 h-5 text-gray-500" />
                            </div>
                          ) : (
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                course.current
                                  ? "bg-[#2e3f6f] text-white"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {course.current ? (
                                <Play className="w-4 h-4" />
                              ) : (
                                <span className="font-medium">{index + 1}</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{course.title}</h4>
                            {course.current && (
                              <Badge className="bg-[#2e3f6f] text-white text-xs">
                                Current
                              </Badge>
                            )}
                            {course.hassession && (
                              <Badge variant="outline" className="text-xs">
                                <FileCheck className="w-3 h-3 mr-1" />
                                session
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {course.description}
                          </p>
                          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <BookOpen className="w-3 h-3 mr-1" />
                              {course.lessons} lessons
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {course.duration}
                            </span>
                            {course.sessionCompleted && (
                              <span className="flex items-center text-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                session: {course.sessionScore}%
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                          {!course.locked && (
                            <Button variant="ghost" size="sm">
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overview" className="mt-6">
              <Card className="pau-shadow">
                <CardHeader>
                  <CardTitle>About This Course</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground">
                      {module.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">What You'll Learn</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>
                          Effective strategies for online student engagement
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>
                          How to create interactive multimedia content
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>
                          Best practices for digital classroom management
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>
                          session methods for online learning environments
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Skills You'll Gain</h4>
                    <div className="flex flex-wrap gap-2">
                      {module.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* <TabsContent value="reviews" className="mt-6">
              <Card className="pau-shadow">
                <CardHeader>
                  <CardTitle>Student Reviews</CardTitle>
                  <CardDescription>
                    What other educators are saying about this course
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[1, 2, 3].map((review) => (
                      <div
                        key={review}
                        className="border-b pb-6 last:border-b-0"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-[#e6f2ff] rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-[#2e3f6f]" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h5 className="font-medium">Educator {review}</h5>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className="w-4 h-4 fill-current text-yellow-400"
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-muted-foreground text-sm">
                              "This course provided excellent practical
                              strategies that I could immediately implement in
                              my online classes. The content is well-structured
                              and the examples are very relevant."
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              2 weeks ago
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent> */}
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Details */}
          <Card className="pau-shadow">
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Level</span>
                <Badge variant="outline">{module.level}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Courses</span>
                <span className="text-sm font-medium">
                  {module.totalCourses}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="text-sm font-medium">
                  {module.completedCourses}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Enrolled</span>
                <span className="text-sm font-medium">
                  {module.students} students
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">sessions</span>
                <span className="flex items-center text-sm font-medium">
                  <FileCheck className="w-4 h-4 mr-1 text-blue-600" />
                  {module.totalCourses} Required
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Certificate
                </span>
                <span className="flex items-center text-sm font-medium">
                  <Award className="w-4 h-4 mr-1 text-yellow-600" />
                  Yes
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="pau-shadow">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Download Materials
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Share className="w-4 h-4 mr-2" />
                Share Course
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                //onClick={() => onNavigate("module-progress", { moduleId })}
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Progress
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
