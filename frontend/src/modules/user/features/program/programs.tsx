import { useState } from "react";

import {
  BookOpen,
  Clock,
  Users,
  Search,
  Filter,
  Star,
  Play,
  CheckCircle,
  Lock,
  Calendar,
  Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";

export function Program() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "pedagogy", label: "Pedagogy" },
    { value: "technology", label: "Educational Technology" },
    { value: "assessment", label: "Assessment" },
    { value: "leadership", label: "Leadership" },
    { value: "research", label: "Research Methods" },
  ];

  const courses = [
    {
      id: 1,
      title: "Digital Teaching Methods",
      category: "technology",

      duration: "4 hours",
      level: "Intermediate",
      rating: 4.8,
      students: 245,
      progress: 100,
      status: "completed",
      description:
        "Master digital tools and online teaching strategies for modern education.",
      modules: 8,
      certificate: true,
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop",
    },
    {
      id: 2,
      title: "Advanced Classroom Management",
      category: "pedagogy",

      duration: "3 hours",
      level: "Advanced",
      rating: 4.9,
      students: 189,
      progress: 0,
      status: "not_started",
      description:
        "Develop effective classroom management strategies for challenging environments.",
      modules: 6,
      certificate: true,
      image:
        "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=300&h=200&fit=crop",
    },
    {
      id: 3,
      title: "Educational Technology Integration",
      category: "technology",

      duration: "2.5 hours",
      level: "Beginner",
      rating: 4.7,
      students: 312,
      progress: 25,
      status: "in_progress",
      description:
        "Learn to seamlessly integrate technology into your curriculum.",
      modules: 5,
      certificate: true,
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop",
    },
    {
      id: 4,
      title: "Student Assessment Strategies",
      category: "assessment",

      duration: "4.5 hours",
      level: "Intermediate",
      rating: 4.6,
      students: 156,
      progress: 60,
      status: "in_progress",
      description:
        "Develop comprehensive assessment methods that truly measure learning.",
      modules: 9,
      certificate: true,
      image:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=200&fit=crop",
    },
    {
      id: 5,
      title: "Educational Leadership Excellence",
      category: "leadership",

      duration: "6 hours",
      level: "Advanced",
      rating: 4.9,
      students: 98,
      progress: 0,
      status: "locked",
      description:
        "Build leadership skills for educational administration and team management.",
      modules: 12,
      certificate: true,
      prerequisite: "Complete 3 intermediate courses",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop",
    },
    {
      id: 6,
      title: "Research Methods in Education",
      category: "research",

      duration: "5 hours",
      level: "Advanced",
      rating: 4.8,
      students: 124,
      progress: 0,
      status: "not_started",
      description:
        "Master quantitative and qualitative research methods for educational studies.",
      modules: 10,
      certificate: true,
      image:
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&h=200&fit=crop",
    },
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "in_progress":
        return <Play className="w-5 h-5 text-blue-600" />;
      case "locked":
        return <Lock className="w-5 h-5 text-gray-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "locked":
        return <Badge variant="secondary">Locked</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const myLearning = courses.filter(
    (course) => course.status === "in_progress" || course.status === "completed"
  );
  const availableCourses = courses.filter(
    (course) => course.status === "not_started" || course.status === "locked"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>Learning Modules</h1>
          <p className="text-muted-foreground mt-1">
            Expand your expertise with our comprehensive course catalog
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-[#e6f2ff] text-[#2e3f6f]">
            {myLearning.length} Active Courses
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="pau-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search courses, instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Course Tabs */}
      <Tabs defaultValue="my-learning" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-learning">
            My Learning ({myLearning.length})
          </TabsTrigger>
          <TabsTrigger value="catalog">
            Course Catalog ({availableCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-learning" className="space-y-6 mt-6">
          {myLearning.length === 0 ? (
            <Card className="pau-shadow">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No active courses</h3>
                <p className="text-muted-foreground mb-6">
                  Start your learning journey by enrolling in a course from our
                  catalog.
                </p>
                <Button
                  className="pau-gradient"
                  // onClick={() => onNavigate?.("modules")}
                >
                  Browse Catalog
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {myLearning.map((course) => (
                <Card
                  key={course.id}
                  className="pau-shadow hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {course.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {course.duration}
                          </span>
                          <span className="flex items-center">
                            <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                            {course.rating}
                          </span>
                          <span className="flex items-center">
                            <BookOpen className="w-3 h-3 mr-1" />
                            {course.modules} modules
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        {getStatusBadge(course.status)}
                      </div>
                    </div>

                    {course.status === "in_progress" && (
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{course.level}</Badge>
                        {course.certificate && (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800"
                          >
                            <Award className="w-3 h-3 mr-1" />
                            Certificate
                          </Badge>
                        )}
                      </div>
                      {/* <Button
                        className="pau-gradient"
                        disabled={course.status === "completed"}
                        // onClick={() =>
                        //   onNavigate?.("module-detail", { moduleId: course.id })
                        // }
                      >
                        {course.status === "completed"
                          ? "View Course"
                          : "Continue"}
                      </Button> */}
                      {course.status === "completed" ? (
                        <Button className="pau-gradient" disabled={true}>
                          Completed
                        </Button>
                      ) : (
                        <Button asChild className="pau-gradient">
                          <Link
                            to="/program/$id"
                            params={{ id: String(course.id) }}
                          >
                            Continue
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="catalog" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCourses
              .filter(
                (course) =>
                  course.status === "not_started" || course.status === "locked"
              )
              .map((course) => (
                <Card
                  key={course.id}
                  className="pau-shadow hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {getStatusIcon(course.status)}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {course.description}
                          </p>
                        </div>
                        <div className="ml-4">
                          {getStatusIcon(course.status)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {course.students} enrolled
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {course.duration}
                        </span>
                        <span className="flex items-center">
                          <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                          {course.rating}
                        </span>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <p>{course.modules} modules</p>
                      </div>

                      {course.prerequisite && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <Lock className="w-3 h-3 inline mr-1" />
                            {course.prerequisite}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{course.level}</Badge>
                          {course.certificate && (
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-yellow-800"
                            >
                              <Award className="w-3 h-3 mr-1" />
                              Certificate
                            </Badge>
                          )}
                        </div>
                        <Button
                          className="pau-gradient"
                          disabled={course.status === "locked"}
                          //   onClick={() =>
                          //     course.status !== "locked" &&
                          //     onNavigate?.("module-detail", {
                          //       moduleId: course.id,
                          //     })
                          //   }
                        >
                          {course.status === "locked"
                            ? "Locked"
                            : "View Course"}
                        </Button>
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
