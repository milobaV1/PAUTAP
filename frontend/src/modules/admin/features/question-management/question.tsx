import { useState } from "react";

import {
  Target,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { z } from "zod";
import { CRISP } from "@/service/enums/crisp.enum";
import { Difficulty } from "@/service/enums/difficulty.enum";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roles } from "@/lib/roles";
import { Checkbox } from "@/components/ui/checkbox";

const questionSchema = z
  .object({
    crispType: z.enum(CRISP, {
      message: "Please select a CRISP type",
    }),
    difficulty: z.enum(Difficulty, {
      message: "Please select a difficulty level",
    }),
    questionType: z.enum([
      "multiple-choice",
      "true-false",
      "short-answer",
      "essay",
    ]),
    questionText: z
      .string()
      .min(10, "Question must be at least 10 characters long")
      .max(1000, "Question must not exceed 1000 characters"),
    // Multiple choice options (only required if question type is multiple-choice)
    options: z
      .array(
        z.object({
          text: z.string().min(4, "Option cannot be empty"),
          isCorrect: z.boolean(),
        })
      )
      .optional(),
    correctAnswer: z.string().optional(), // For true/false questions
    // keyPoints: z.string().optional(), // For short-answer and essay questions
    explanation: z
      .string()
      .max(500, "Explanation must not exceed 500 characters")
      .optional(),
    roles: z
      .array(
        z.enum(
          roles.map((role) => role.value),
          {
            message: "Please select at least one role",
          }
        )
      )
      .min(1, "At least one role is required"),
  })
  .refine(
    (data) => {
      // Custom validation for multiple choice questions
      if (data.questionType === "multiple-choice") {
        if (!data.options || data.options.length < 2) {
          return false;
        }
        const correctAnswers = data.options.filter((opt) => opt.isCorrect);
        return correctAnswers.length === 1;
      }
      return true;
    },
    {
      message:
        "Multiple choice questions must have at least 2 options and exactly 1 correct answer",
      path: ["options"],
    }
  );

export function QuestionManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [questionType, setQuestionType] = useState("multiple-choice");

  const questions = [
    {
      id: 1,
      question:
        "Which digital tool is most effective for creating interactive presentations?",
      type: "Multiple Choice",
      course: "Digital Teaching Methods",
      difficulty: "Easy",
      correctAnswer: "Interactive whiteboards",
      options: [
        "PowerPoint",
        "Interactive whiteboards",
        "PDF documents",
        "Word documents",
      ],
      usageCount: 245,
      successRate: 87,
      created: "2024-01-10",
      lastUsed: "2024-01-15",
    },
    {
      id: 2,
      question:
        "Explain the benefits of flipped classroom methodology in higher education.",
      type: "Short Answer",
      course: "Educational Leadership",
      difficulty: "Medium",
      correctAnswer: "",
      keyPoints: [
        "Student engagement",
        "Active learning",
        "Flexible pacing",
        "Better use of class time",
      ],
      usageCount: 156,
      successRate: 73,
      created: "2024-01-08",
      lastUsed: "2024-01-14",
    },
    {
      id: 3,
      question:
        "What are the key components of an effective assessment rubric?",
      type: "Multiple Choice",
      course: "Assessment Strategies",
      difficulty: "Medium",
      correctAnswer: "Clear criteria, performance levels, descriptors",
      options: [
        "Clear criteria, performance levels, descriptors",
        "Grades only",
        "Student names and scores",
        "Course objectives only",
      ],
      usageCount: 189,
      successRate: 91,
      created: "2024-01-05",
      lastUsed: "2024-01-13",
    },
    {
      id: 4,
      question:
        "Describe three strategies for promoting inclusive learning environments.",
      type: "Essay",
      course: "Educational Leadership",
      difficulty: "Hard",
      correctAnswer: "",
      keyPoints: [
        "Universal design",
        "Cultural responsiveness",
        "Differentiated instruction",
        "Accessibility",
      ],
      usageCount: 98,
      successRate: 65,
      created: "2024-01-12",
      lastUsed: "2024-01-16",
    },
    {
      id: 5,
      question: "True or False: Formative assessments should always be graded.",
      type: "True/False",
      course: "Assessment Strategies",
      difficulty: "Easy",
      correctAnswer: "False",
      explanation:
        "Formative assessments are primarily for feedback and learning, not grading.",
      usageCount: 267,
      successRate: 78,
      created: "2024-01-07",
      lastUsed: "2024-01-17",
    },
  ];

  const courses = [
    { value: "all", label: "All Courses" },
    { value: "digital-teaching-methods", label: "Digital Teaching Methods" },
    { value: "educational-leadership", label: "Educational Leadership" },
    { value: "assessment-strategies", label: "Assessment Strategies" },
    { value: "research-methods", label: "Research Methods" },
  ];

  const questionTypes = [
    { value: "all", label: "All Types" },
    { value: "multiple-choice", label: "Multiple Choice" },
    { value: "true-false", label: "True/False" },
    { value: "short-answer", label: "Short Answer" },
    { value: "essay", label: "Essay" },
  ];

  const difficulties = [
    { value: "all", label: "All Difficulties" },
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ];

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse =
      selectedCourse === "all" ||
      question.course.toLowerCase().replace(" ", "-") === selectedCourse;
    const matchesType =
      selectedType === "all" ||
      question.type.toLowerCase().replace(" ", "-") === selectedType;
    const matchesDifficulty =
      selectedDifficulty === "all" ||
      question.difficulty.toLowerCase() === selectedDifficulty;
    return matchesSearch && matchesCourse && matchesType && matchesDifficulty;
  });

  const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "multiple choice":
        return (
          <Badge className="bg-blue-100 text-blue-800">Multiple Choice</Badge>
        );
      case "true/false":
        return (
          <Badge className="bg-green-100 text-green-800">True/False</Badge>
        );
      case "short answer":
        return (
          <Badge className="bg-purple-100 text-purple-800">Short Answer</Badge>
        );
      case "essay":
        return <Badge className="bg-orange-100 text-orange-800">Essay</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return <Badge className="bg-green-100 text-green-800">Easy</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "hard":
        return <Badge className="bg-red-100 text-red-800">Hard</Badge>;
      default:
        return <Badge variant="outline">{difficulty}</Badge>;
    }
  };

  const totalStats = {
    totalQuestions: questions.length,
    averageSuccessRate: Math.round(
      questions.reduce((sum, q) => sum + q.successRate, 0) / questions.length
    ),
    totalUsage: questions.reduce((sum, q) => sum + q.usageCount, 0),
    activeQuestions: questions.filter((q) => q.usageCount > 0).length,
  };

  const form = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      crispType: CRISP.C,
      difficulty: Difficulty.BEGINNER,
      questionType: "multiple-choice",
      questionText: "",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      correctAnswer: undefined,
      //keyPoints: undefined,
      explanation: "",
      roles: [],
    },
  });

  async function handleSubmit(values: z.infer<typeof questionSchema>) {
    console.log(values);
    const { questionType, roles, explanation, ...data } = values;
    // const editedData = data as UserSignUpInterface;
    // console.log("This is the sign up data I am sending", editedData);
    // const response = await createUser(editedData);
    // console.log(response);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Question Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage assessment questions for courses
          </p>
        </div>
        <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion}>
          <DialogTrigger asChild>
            <Button className="pau-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add New Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Question</DialogTitle>
              <DialogDescription>
                Add a new assessment question to the question bank.
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-6"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="crisp">CRISP Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="community">Community</SelectItem>
                      <SelectItem value="respect">Respect</SelectItem>
                      <SelectItem value="integrity">Integrity</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="professionalism">
                        Professionalism
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* <div>
                <Label htmlFor="questionType">Question Type</Label>
                <RadioGroup
                  value={questionType}
                  onValueChange={setQuestionType}
                  className="flex space-x-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="multiple-choice" id="mc" />
                    <Label htmlFor="mc">Multiple Choice</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true-false" id="tf" />
                    <Label htmlFor="tf">True/False</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="short-answer" id="sa" />
                    <Label htmlFor="sa">Short Answer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="essay" id="essay" />
                    <Label htmlFor="essay">Essay</Label>
                  </div>
                </RadioGroup>
              </div> */}

              <div>
                <Label htmlFor="questionText">Question</Label>
                <Textarea
                  id="questionText"
                  placeholder="Enter your question here..."
                  rows={3}
                />
              </div>

              {questionType === "multiple-choice" && (
                <div className="space-y-4">
                  <Label>Answer Options</Label>
                  {[1, 2, 3, 4].map((num) => (
                    <div key={num} className="flex items-center space-x-3">
                      <RadioGroup>
                        <RadioGroupItem
                          value={`option-${num}`}
                          id={`option-${num}`}
                        />
                      </RadioGroup>
                      <Input placeholder={`Option ${num}`} className="flex-1" />
                      <Label
                        htmlFor={`option-${num}`}
                        className="text-sm text-muted-foreground"
                      >
                        Correct
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {/* {questionType === "true-false" && (
                <div>
                  <Label>Correct Answer</Label>
                  <RadioGroup className="flex space-x-6 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="true" />
                      <Label htmlFor="true">True</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="false" />
                      <Label htmlFor="false">False</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {(questionType === "short-answer" ||
                questionType === "essay") && (
                <div>
                  <Label htmlFor="keyPoints">Key Points for Grading</Label>
                  <Textarea
                    id="keyPoints"
                    placeholder="Enter key points that should be included in correct answers..."
                    rows={4}
                  />
                </div>
              )} */}

              <div>
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Textarea
                  id="explanation"
                  placeholder="Provide an explanation for the correct answer..."
                  rows={3}
                />
              </div>
              {/* <div>
                <Label htmlFor="roles">Roles</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the roles this question applies to" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facility_attendant">
                      Facility Attendant
                    </SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="front_desk">Front Desk</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="cafeteria">Cafeteria</SelectItem>
                    <SelectItem value="horticulture">Horticulture</SelectItem>
                    <SelectItem value="admissions">Admissions</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="student_affairs">
                      Student Affairs
                    </SelectItem>
                    <SelectItem value="lecturer">Lecturer</SelectItem>
                    <SelectItem value="support_staff">Support Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
              <div>
                <Label htmlFor="roles">Roles</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {roles.map((role) => (
                    <div
                      key={role.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={role.value}
                        value={role.value}
                        // ✅ if you're using react-hook-form
                        {...form.register("roles")}
                      />
                      <label
                        htmlFor={role.value}
                        className="text-sm text-muted-foreground"
                      >
                        {role.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddQuestion(false)}
                >
                  Cancel
                </Button>
                <Button className="pau-gradient">Create Question</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="pau-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {totalStats.totalQuestions}
                </p>
                <p className="text-sm text-muted-foreground">Total Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="pau-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {totalStats.activeQuestions}
                </p>
                <p className="text-sm text-muted-foreground">
                  Active Questions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="pau-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {totalStats.averageSuccessRate}%
                </p>
                <p className="text-sm text-muted-foreground">
                  Avg Success Rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="pau-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{totalStats.totalUsage}</p>
                <p className="text-sm text-muted-foreground">Total Usage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="pau-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search questions by content or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.value} value={course.value}>
                    {course.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {questionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedDifficulty}
              onValueChange={setSelectedDifficulty}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((difficulty) => (
                  <SelectItem key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card className="pau-shadow">
        <CardHeader>
          <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
          <CardDescription>
            Manage assessment questions and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <div
                key={question.id}
                className="p-6 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium">{question.question}</h4>
                    </div>
                    <div className="flex items-center space-x-4 mb-3">
                      {getTypeBadge(question.type)}
                      {getDifficultyBadge(question.difficulty)}
                      <Badge variant="outline">{question.course}</Badge>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        Used {question.usageCount} times
                      </span>
                      <span className="flex items-center">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        {question.successRate}% success rate
                      </span>
                      <span>Last used: {question.lastUsed}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {question.type === "Multiple Choice" && (
                  <div className="pl-4 border-l-2 border-gray-200">
                    <p className="text-sm font-medium mb-2">Options:</p>
                    <div className="space-y-1 text-sm">
                      {question.options?.map((option, index) => (
                        <div
                          key={index}
                          className={`flex items-center space-x-2 ${
                            option === question.correctAnswer
                              ? "text-green-600 font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {option === question.correctAnswer ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No questions found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or create a new question.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
