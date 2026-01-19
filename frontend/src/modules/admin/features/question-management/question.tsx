"use client";
import { useEffect, useState } from "react";
import {
  Target,
  Search,
  Plus,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CRISP } from "@/service/enums/crisp.enum";

import type { addQuestionDto } from "@/service/interfaces/question.interface";
import { useAddQuestion } from "./api/add-quetion";
import { useAdminQuestions } from "./api/get-questions";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useDeleteQuestion } from "./api/delete-question";
import { toast } from "sonner";
import { QuestionDetailsModal } from "./question-details";

const questionSchema = z.object({
  crispType: z.enum(CRISP),
  questionType: z.enum([
    "multiple-choice",
    "true-false",
    "short-answer",
    "essay",
  ]),
  questionText: z.string().min(10).max(1000),
  options: z.array(z.object({ text: z.string().min(1) })).optional(),
  correctAnswer: z.number().optional(),
  explanation: z.string().max(500).optional(),
  //roles: z.array(z.enum(roles.map((r) => r.value))).min(1),
});

export function QuestionManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const limit = 5;

  const {
    data,
    isLoading,
    isError: isGetQuestionError,
    error: getQuestionError,
  } = useAdminQuestions(page, limit, debouncedSearch);

  const { mutate: addQuestion, isPending, isError, error } = useAddQuestion();
  const { mutate: deleteQuestion } = useDeleteQuestion();
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  );

  const form = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      crispType: CRISP.C,
      questionType: "multiple-choice",
      questionText: "",
      options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
      correctAnswer: 0,
      explanation: "",
      //roles: [],
    },
  });
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  async function onSubmit(values: z.infer<typeof questionSchema>) {
    const { questionType, explanation, options, ...rest } = values;
    // const roleIds = getRoleIds(roles);

    try {
      const payload: addQuestionDto = {
        crispCategory: rest.crispType,
        questionText: rest.questionText,
        options: options ? options.map((opt) => opt.text) : [],
        correctAnswer: values.correctAnswer ?? 0,
        explanation,
        //roles: roleIds,
      };
      addQuestion(payload);
      toast.success("✅ Question created successfully");
      form.reset();
      setShowAddQuestion(false);
    } catch (error) {
      console.error("❌ Question creation failed:", error);
      toast.error("Failed to create question. Please try again.");
    }
  }

  if (isLoading) return <p>Loading questions...</p>;
  if (isGetQuestionError || !data)
    return (
      <div>
        <p>Error loading questions</p>
        <p>{getQuestionError ? getQuestionError.message : ""}</p>
      </div>
    );

  const filteredQuestions = data.questions.filter((q) =>
    q.questionText.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(data.totalQuestions / data.limit);

  const handleDelete = (id: string) => {
    deleteQuestion(id, {
      onSuccess: () => {
        toast.success("✅ Question deleted successfully");
      },
      onError: (error: any) => {
        console.error("❌ Delete failed:", error);
        toast.error("Failed to delete question");
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1>Question Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage session questions
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
                Add a new session question to the question bank.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {/* CRISP Select */}
                  <FormField
                    control={form.control}
                    name="crispType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CRISP Type</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="community">
                                Community
                              </SelectItem>
                              <SelectItem value="respect">Respect</SelectItem>
                              <SelectItem value="integrity">
                                Integrity
                              </SelectItem>
                              <SelectItem value="service">Service</SelectItem>
                              <SelectItem value="professionalism">
                                Professionalism
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* Question Text */}
                <FormField
                  control={form.control}
                  name="questionText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your question here..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Multiple Choice Options */}
                <FormItem>
                  <FormLabel>Answer Options</FormLabel>
                  <FormControl>
                    <RadioGroup
                      // Watch the selected correct answer index
                      value={form.watch("correctAnswer")?.toString()}
                      onValueChange={(val) => {
                        form.setValue("correctAnswer", parseInt(val), {
                          shouldValidate: true,
                        });
                      }}
                    >
                      {[0, 1, 2, 3].map((idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          {/* Radio button for choosing the correct answer */}
                          <RadioGroupItem
                            value={idx.toString()}
                            id={`option-${idx}`}
                          />

                          {/* Input for option text */}
                          <Input
                            placeholder={`Option ${idx + 1}`}
                            className="flex-1"
                            {...form.register(`options.${idx}.text`)}
                          />

                          <FormLabel
                            htmlFor={`option-${idx}`}
                            className="text-sm cursor-pointer"
                          >
                            Correct
                          </FormLabel>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </FormItem>

                {/* Explanation */}
                <FormField
                  control={form.control}
                  name="explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Explanation (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide an explanation for the correct answer..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Roles Checkboxes */}
                {/* <FormItem>
                  <FormLabel>Roles</FormLabel>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {roles.map((role) => (
                      <FormField
                        key={role.value}
                        control={form.control}
                        name="roles"
                        render={({ field }) => {
                          const checked =
                            field.value?.includes(role.value) || false;
                          return (
                            <FormItem className="flex flex-row items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  id={role.value}
                                  checked={checked}
                                  onCheckedChange={(isChecked) => {
                                    if (isChecked) {
                                      field.onChange([
                                        ...field.value,
                                        role.value,
                                      ]);
                                    } else {
                                      field.onChange(
                                        field.value.filter(
                                          (val) => val !== role.value
                                        )
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor={role.value}
                                className="text-sm text-muted-foreground"
                              >
                                {role.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                </FormItem> */}
                {isError && (
                  <div className="text-red-600 text-sm">
                    Error submitting question:{" "}
                    {error?.message || "Unknown error"}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddQuestion(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="pau-gradient"
                    disabled={isPending}
                  >
                    {isPending ? "Saving..." : "Create Question"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center">
            <Target className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold">{data.totalQuestions}</p>
              <p className="text-sm text-muted-foreground">Total Questions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold">{data.totalUsage}</p>
              <p className="text-sm text-muted-foreground">Total Usage</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold">Page {data.page}</p>
              <p className="text-sm text-muted-foreground">Current Page</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
          <CardDescription>Manage questions and usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="p-6 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium mb-2">{q.questionText}</h4>
                    <div className="flex items-center text-sm text-muted-foreground space-x-4">
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" /> Used {q.usage} times
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedQuestionId(q.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Dialog
                      open={deleteQuestionId === q.id}
                      onOpenChange={(open) =>
                        !open && setDeleteQuestionId(null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          title="Delete Question"
                          onClick={() => setDeleteQuestionId(q.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="max-w-sm">
                        <DialogHeader>
                          <DialogTitle>Confirm Delete</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this question? This
                            action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="flex justify-end space-x-2 mt-4">
                          <Button
                            variant="outline"
                            onClick={() => setDeleteQuestionId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="pau-gradient"
                            onClick={() => {
                              if (deleteQuestionId) {
                                handleDelete(deleteQuestionId);
                                setDeleteQuestionId(null);
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Options */}
                {q.options.length > 0 && (
                  <div className="pl-4 mt-3 border-l-2 border-gray-200">
                    <p className="text-sm font-medium mb-2">Options:</p>
                    <div className="space-y-1 text-sm">
                      {q.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center space-x-2 ${
                            idx === q.correctAnswer
                              ? "text-green-600 font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {idx === q.correctAnswer ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

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
              Page {data.page} of {totalPages}
            </span>

            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {filteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No questions found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or add a new question.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedQuestionId && (
        <QuestionDetailsModal
          questionId={selectedQuestionId}
          open={!!selectedQuestionId}
          onOpenChange={(open) => !open && setSelectedQuestionId(null)}
        />
      )}
    </div>
  );
}
