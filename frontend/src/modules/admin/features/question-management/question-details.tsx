"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useGetOneQuestion } from "./api/get-one-question";
import { useUpdateQuestion } from "./api/update-question";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Edit, CheckCircle, XCircle, Eye, Target } from "lucide-react";
import { CRISP } from "@/service/enums/crisp.enum";
import { roles, getRoleIds } from "@/lib/roles";

interface QuestionDetailsModalProps {
  questionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const questionSchema = z.object({
  crispType: z.enum([CRISP.C, CRISP.R, CRISP.I, CRISP.S, CRISP.P]),
  questionText: z.string().min(10).max(1000),
  options: z.array(z.object({ text: z.string().min(1) })).optional(),
  correctAnswer: z.number().optional(),
  explanation: z.string().max(500).optional(),
  roles: z.array(z.enum(roles.map((r) => r.value))).min(1),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

export function QuestionDetailsModal({
  questionId,
  open,
  onOpenChange,
}: QuestionDetailsModalProps) {
  const {
    data: question,
    isLoading,
    refetch,
  } = useGetOneQuestion(questionId ?? "", !!questionId && open);
  const { mutateAsync: updateQuestion, isPending: updating } =
    useUpdateQuestion();
  const [editMode, setEditMode] = useState(false);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      crispType: CRISP.C,
      questionText: "",
      options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
      correctAnswer: 0,
      explanation: "",
      roles: [],
    },
  });

  useEffect(() => {
    if (question) {
      // Map role names to role values using case-insensitive matching
      console.log("Question roles from API:", question.roles);
      console.log("Available roles array:", roles);

      const questionRoles =
        question.roles
          ?.map((role) => {
            const matchedRole = roles.find(
              (r) => r.label.toLowerCase() === role.name.toLowerCase()
            );
            console.log(`Mapping "${role.name}" to "${matchedRole?.value}"`);
            return matchedRole?.value || "";
          })
          .filter(Boolean) || [];

      console.log("Final mapped roles:", questionRoles);

      form.reset({
        crispType: question.crispCategory,
        questionText: question.questionText,
        options: question.options.map((opt) => ({ text: opt })),
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || "",
        roles: questionRoles,
      });
    }
  }, [question, form]);

  const handleSave = async (values: QuestionFormValues) => {
    if (!question) return;

    const { roles: selectedRoles, ...rest } = values;
    const roleIds = getRoleIds(selectedRoles);

    try {
      const payload = {
        crispCategory: rest.crispType,
        questionText: rest.questionText,
        options: rest.options ? rest.options.map((opt) => opt.text) : [],
        correctAnswer: rest.correctAnswer ?? 0,
        explanation: rest.explanation,
        roleIds,
      };

      await updateQuestion({ id: question.id, data: payload });
      toast.success("Question updated successfully!");
      setEditMode(false);
      onOpenChange(false);
      refetch();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update question.");
    }
  };

  if (isLoading) return <p>Loading question details...</p>;
  if (!question) return <p>No question found</p>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Question Details</DialogTitle>
          <DialogDescription>
            {editMode
              ? "Edit question information"
              : "Detailed information about this question"}
          </DialogDescription>
        </DialogHeader>

        {/* Question Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{question.crispCategory}</Badge>
                <Badge variant={question.isActive ? "default" : "secondary"}>
                  {question.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <h3 className="text-lg font-semibold mb-3">
                {question.questionText}
              </h3>

              {question.explanation && (
                <div className="p-3 bg-blue-50 rounded-lg mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Explanation:</strong> {question.explanation}
                  </p>
                </div>
              )}
            </div>

            {!editMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>

          {/* Question Stats & Options */}
          {!editMode && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Eye className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                  <div className="text-sm font-medium">
                    {question.usages?.reduce(
                      (sum, usage) => sum + usage.usageCount,
                      0
                    ) || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Usage
                  </div>
                </div>
                <div className="text-center">
                  <Target className="w-5 h-5 mx-auto text-green-600 mb-1" />
                  <div className="text-sm font-medium">
                    {question.options.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Options</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">
                    {new Date(question.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Created</div>
                </div>
              </div>

              {/* Options Display */}
              {question.options.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Answer Options:</h4>
                  {question.options.map((option, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center space-x-3 p-3 rounded-lg border ${
                        idx === question.correctAnswer
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      {idx === question.correctAnswer ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span
                        className={
                          idx === question.correctAnswer
                            ? "font-medium text-green-800"
                            : ""
                        }
                      >
                        {option}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Roles */}
              {question.roles && question.roles.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Applicable Roles:</h4>
                  <div className="flex flex-wrap gap-2">
                    {question.roles.map((role) => (
                      <Badge key={role.id} variant="secondary">
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit Form */}
        {editMode && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSave)}
              className="space-y-4"
            >
              {/* CRISP Type */}
              <FormField
                control={form.control}
                name="crispType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CRISP Category</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {/* Options */}
              <FormItem>
                <FormLabel>Answer Options</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={form.watch("correctAnswer")?.toString()}
                    onValueChange={(val) => {
                      form.setValue("correctAnswer", parseInt(val), {
                        shouldValidate: true,
                      });
                    }}
                  >
                    {[0, 1, 2, 3].map((idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <RadioGroupItem
                          value={idx.toString()}
                          id={`option-${idx}`}
                        />
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

              {/* Roles */}
              <FormItem>
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
              </FormItem>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditMode(false);
                    if (question) {
                      const questionRoles =
                        question.roles
                          ?.map((role) => {
                            const matchedRole = roles.find(
                              (r) =>
                                r.label.toLowerCase() ===
                                role.name.toLowerCase()
                            );
                            return matchedRole?.value || "";
                          })
                          .filter(Boolean) || [];

                      form.reset({
                        crispType: question.crispCategory,
                        questionText: question.questionText,
                        options: question.options.map((opt) => ({ text: opt })),
                        correctAnswer: question.correctAnswer,
                        explanation: question.explanation || "",
                        roles: questionRoles,
                      });
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="pau-gradient"
                  disabled={updating}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
