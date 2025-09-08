import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  CheckCircle,
  Clock,
  Users,
  MessageSquare,
  Download,
  Bookmark,
  Share,
  Eye,
  Type,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Route } from "@/routes/(user)/_layout/program/$id/course/$courseId";
import { useNavigate } from "@tanstack/react-router";

export function CourseContent() {
  //const [readingProgress, setReadingProgress] = useState(65); // Progress through reading
  const [notes, setNotes] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [fontSize, setFontSize] = useState(16); // Reading font size
  const [readingTime] = useState(15); // Estimated reading time in minutes

  const { id, courseId } = Route.useParams();
  const navigate = useNavigate();

  // Mock lesson data - now focused on text content
  const lesson = {
    id: courseId,
    title: "Student Engagement Strategies in Digital Learning",
    description:
      "Learn effective techniques to keep students engaged in virtual learning environments through practical strategies and evidence-based approaches.",
    readingTime: `${readingTime} min read`,
    type: "article",
    courseTitle: "Digital Teaching Methods",
    //author: "Dr. Sarah Johnson",
    content: `Professional Ethics: Foundations for Ethical Practice

Introduction

Professional ethics forms the cornerstone of trust between individuals, institutions, and society. In an increasingly complex world where decisions carry far-reaching consequences, understanding and applying ethical principles is essential for maintaining the integrity of professional practice and societal well-being. This course explores fundamental ethical principles, their practical application in professional settings, and the development of moral reasoning skills necessary for navigating complex ethical dilemmas in contemporary practice.

Major Ethical Frameworks

Three primary ethical frameworks guide professional decision-making. **Consequentialism** judges actions based on their outcomes, following the principle of "the greatest good for the greatest number," making it valuable for policy decisions and resource allocation. **Deontological ethics** emphasizes the inherent rightness or wrongness of actions regardless of consequences, focusing on duties, rights, and universal principles like truthfulness and respect for human dignity. **Virtue ethics** centers on moral character, asking "What would a virtuous person do?" and emphasizing qualities like integrity, honesty, compassion, justice, and courage. Understanding these frameworks provides professionals with multiple perspectives for analyzing ethical dilemmas and making principled decisions.

Ethical Decision-Making in Practice

Effective ethical decision-making follows a systematic approach: identify the ethical issue and affected stakeholders, gather relevant information including legal and cultural considerations, generate alternative courses of action, apply ethical frameworks to evaluate options, implement the chosen decision, and monitor outcomes for future learning. Key professional ethics areas include maintaining confidentiality and privacy, managing conflicts of interest through transparent disclosure, establishing appropriate professional boundaries, and demonstrating integrity through consistent truthfulness and accountability. These principles must be balanced with cultural sensitivity while maintaining universal standards of human dignity and respect.

Contemporary Ethical Challenges

Modern professionals face evolving ethical challenges that require adaptive thinking and continuous learning. Technology presents new dilemmas around data privacy, artificial intelligence bias, digital boundaries, and equal access to technological resources. Global interconnectedness raises questions about environmental sustainability, resource distribution, and corporate social responsibility. Cultural diversity in professional settings demands sensitivity to different value systems while maintaining core ethical principles. These contemporary issues require professionals to expand traditional ethical frameworks and develop cultural competency alongside moral reasoning skills.

Building Ethical Competence

Developing ethical competence is a lifelong journey requiring ongoing self-reflection, professional development, and commitment to creating ethical environments. Professionals must regularly examine their values, biases, and decision-making processes while seeking continuing education in ethics and engaging in peer consultation. Creating ethical workplaces involves modeling ethical behavior, speaking up about concerns, supporting colleagues facing dilemmas, and contributing to clear policies and procedures. The ultimate goal is building a culture of trust, integrity, and social responsibility that serves both individual professionals and the broader community they serve.`,
    resources: [
      { name: "Engagement Strategy Checklist", type: "PDF", size: "245 KB" },
      { name: "Interactive Tools Comparison", type: "PDF", size: "892 KB" },
      { name: "Student Feedback Templates", type: "DOCX", size: "156 KB" },
      { name: "Breakout Activity Examples", type: "PDF", size: "567 KB" },
    ],
  };

  const courseNavigation = {
    currentLesson: 4,
    totalLessons: 8,
    previousLesson: { id: 3, title: "Interactive Content Creation" },
    nextLesson: null, // Make this null to simulate final lesson for demo purposes
  };

  const adjustFontSize = (change: number) => {
    const newSize = Math.max(12, Math.min(24, fontSize + change));
    setFontSize(newSize);
  };

  const handleCompleteLesson = () => {
    // Check if this is the last lesson of the course
    const isLastLesson = !courseNavigation.nextLesson;

    if (isLastLesson) {
      // Navigate to course assessment after completing final lesson
      //   onNavigate("assessment-taking", {
      //     moduleId: courseId,
      //     courseId: courseId,
      //     assessmentId: courseId,
      //   });
      navigate({
        to: "/program/$id/course/$courseId/assessment/$assessmentId",
        params: { id, courseId, assessmentId: courseId },
      });
    } else {
      // Continue to next lesson
      //   onNavigate('lesson', {
      //     courseId,
      //     lessonId: courseNavigation.nextLesson.id
      //   });
    }
  };

  // Simulate reading progress based on scroll or time
  //   const handleScrollProgress = () => {
  //     // In a real implementation, this would track actual scroll position
  //     setReadingProgress(Math.min(100, readingProgress + 5));
  //   };

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          //onClick={() => onNavigate("module-detail", { moduleId: courseId })}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>

        <div className="text-center">
          <h2 className="font-semibold">{lesson.courseTitle}</h2>
          <p className="text-sm text-muted-foreground">
            Lesson {courseNavigation.currentLesson} of{" "}
            {courseNavigation.totalLessons}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            <Bookmark
              className={`w-4 h-4 ${isBookmarked ? "fill-current text-[#2e3f6f]" : ""}`}
            />
          </Button>
          <Button variant="ghost" size="sm">
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Reading Interface */}
          <Card className="pau-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>{lesson.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {lesson.description}
                  </CardDescription>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {lesson.readingTime}
                    </span>
                    {/* <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {lesson.author}
                    </span> */}
                    {/* <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {readingProgress}% read
                    </span> */}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Badge className="bg-green-100 text-green-800">
                    <BookOpen className="w-3 h-3 mr-1" />
                    Article
                  </Badge>
                </div>
              </div>
            </CardHeader>

            {/* Reading Controls */}
            <div className="px-6 py-3 border-t border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">Reading Tools:</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustFontSize(-2)}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm min-w-12 text-center">
                      {fontSize}px
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustFontSize(2)}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {/* <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Progress:
                  </span>
                  <div className="w-32">
                    <Progress value={readingProgress} className="h-2" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {readingProgress}%
                  </span>
                </div> */}
              </div>
            </div>

            <CardContent className="p-8">
              {/* Article Content */}
              <div
                className="prose prose-gray max-w-none"
                style={{ fontSize: `${fontSize}px`, lineHeight: "1.7" }}
                //onScroll={handleScrollProgress}
              >
                <div className="whitespace-pre-line">{lesson.content}</div>
              </div>

              {/* Lesson Navigation */}
              <div className="flex items-center justify-between pt-8 mt-8 border-t">
                <div>
                  {courseNavigation.previousLesson && (
                    <Button
                      variant="outline"
                      //   onClick={() =>
                      //     onNavigate("lesson", {
                      //       courseId,
                      //       lessonId: courseNavigation.previousLesson!.id,
                      //     })
                      //   }
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous: {courseNavigation.previousLesson.title}
                    </Button>
                  )}
                </div>

                <Button className="pau-gradient" onClick={handleCompleteLesson}>
                  {courseNavigation.nextLesson ? (
                    <>
                      Complete & Continue
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Take Assessment
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Progress */}
          <Card className="pau-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Course Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#2e3f6f]">50%</div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
                <Progress value={50} className="h-2" />
                <div className="text-sm text-muted-foreground text-center">
                  4 of 8 lessons completed
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Notes */}
          {/* <Card className="pau-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-[#2e3f6f]" />
                My Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Take notes about this lesson..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-32 resize-none"
              />
              <Button className="w-full mt-3" variant="outline">
                Save Notes
              </Button>
            </CardContent>
          </Card> */}

          {/* Resources */}
          {/* <Card className="pau-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="w-5 h-5 mr-2 text-[#2e3f6f]" />
                Lesson Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lesson.resources.map((resource, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{resource.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {resource.type} • {resource.size}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}
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

          {/* Discussion */}
          {/* <Card className="pau-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-[#2e3f6f]" />
                Discussion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Sarah M.</p>
                  <p className="text-sm text-muted-foreground">
                    Great strategies! I've already started using polls in my
                    classes.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    2 hours ago
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Mike R.</p>
                  <p className="text-sm text-muted-foreground">
                    The breakout room tips were very helpful. Thank you!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    1 day ago
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-3">
                Join Discussion
              </Button>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}
