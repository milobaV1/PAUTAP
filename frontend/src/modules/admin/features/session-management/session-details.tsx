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
import { useGetOneSession } from "./api/get-one-session";
import { useUpdateSession } from "./api/update-session";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Edit, Clock, Calendar, FileText } from "lucide-react";

interface SessionDetailsModalProps {
  sessionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sessionSchema = z.object({
  title: z.string().min(1, "Session title is required"),
  description: z.string().optional(),
  timeLimit: z
    .number()
    .positive("Must be greater than 0")
    .optional()
    .refine((val) => val === undefined || !isNaN(val), {
      message: "Time limit must be a number",
    }),
});

type SessionFormValues = z.infer<typeof sessionSchema>;

export function SessionDetailsModal({
  sessionId,
  open,
  onOpenChange,
}: SessionDetailsModalProps) {
  const {
    data: session,
    isLoading,
    refetch,
  } = useGetOneSession(sessionId ?? "", !!sessionId && open);
  const { mutateAsync: updateSession, isPending: updating } =
    useUpdateSession();
  const [editMode, setEditMode] = useState(false);

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: "",
      description: "",
      timeLimit: 60,
    },
  });

  useEffect(() => {
    if (session) {
      form.reset({
        title: session.title,
        description: session.description || "",
        timeLimit: session.timeLimit,
      });
    }
  }, [session, form]);

  const handleSave = async (values: SessionFormValues) => {
    if (!session) return;
    try {
      await updateSession({ id: session.id, data: values });
      toast.success("Session updated successfully!");
      setEditMode(false);
      onOpenChange(false);
      refetch();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update session.");
    }
  };

  if (isLoading) return <p>Loading session details...</p>;
  if (!session) return <p>No session found</p>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Session Details</DialogTitle>
          <DialogDescription>
            {editMode
              ? "Edit session information"
              : "Detailed information about this session"}
          </DialogDescription>
        </DialogHeader>

        {/* Session Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{session.title}</h2>
              <p className="text-muted-foreground mt-2">
                {session.description || "No description provided"}
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant={session.isActive ? "default" : "secondary"}>
                  {session.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge
                  variant={session.questionsGenerated ? "default" : "outline"}
                >
                  {session.questionsGenerated
                    ? "Questions Generated"
                    : "No Questions"}
                </Badge>
              </div>
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

          {/* Session Stats */}
          {!editMode && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <Clock className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                <div className="text-sm font-medium">{session.timeLimit}s</div>
                <div className="text-xs text-muted-foreground">Time Limit</div>
              </div>
              <div className="text-center">
                <FileText className="w-5 h-5 mx-auto text-green-600 mb-1" />
                <div className="text-sm font-medium">
                  {session.roleCategoryQuestions?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Categories</div>
              </div>
              <div className="text-center">
                <Calendar className="w-5 h-5 mx-auto text-purple-600 mb-1" />
                <div className="text-sm font-medium">
                  {new Date(session.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground">Created</div>
              </div>
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
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter session title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter session description"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Limit (seconds)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="60"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditMode(false);
                    form.reset({
                      title: session.title,
                      description: session.description || "",
                      timeLimit: session.timeLimit,
                    });
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
