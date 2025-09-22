"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  HelpCircle,
  BookOpen,
  Hash,
} from "lucide-react";
import { useGetSessionsForAdmin } from "./api/get-session-stats";
import type {
  AdminSessionSummary,
  CreateSessionDto,
} from "@/service/interfaces/session.interface";
import { useCreateSession } from "./api/create-session";
import { toast } from "sonner";
import { useDeleteSession } from "./api/delete-session";
import { useUpdateSession } from "./api/update-session";

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

export function TrainingSessionManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateSession, setShowCreateSession] = useState(false);
  //   const [sessionName, setSessionName] = useState("");
  //   const [sessionDescription, setSessionDescription] = useState("");
  const { mutateAsync: createSession, isPending, isError } = useCreateSession();
  const { mutate: deleteSession } = useDeleteSession();
  const { mutate: updateSession } = useUpdateSession();
  const [page, setPage] = useState(1);
  const limit = 5;

  const form = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: "",
      description: "",
      timeLimit: 60, // default in minutes
    },
  });
  const { data, isLoading } = useGetSessionsForAdmin(page, limit);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  const filteredSessions = data.sessions.filter(
    (session: AdminSessionSummary) =>
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (session.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleDelete = (sessionId: string) => {
    deleteSession(sessionId, {
      onSuccess: () => {
        toast.success("✅ Session deleted successfully");
      },
      onError: (error: any) => {
        console.error("❌ Delete failed:", error);
        toast.error("Failed to delete session");
      },
    });
  };

  const handleUpdate = (sessionId: string) => {
    updateSession(
      { id: sessionId, data: { title: "Updated Title" } }, // 🔥 replace with form data
      {
        onSuccess: () => {
          toast.success("✅ Session updated successfully");
        },
        onError: (error: any) => {
          console.error("❌ Update failed:", error);
          toast.error("Failed to update session");
        },
      }
    );
  };

  //   const resetForm = () => {
  //     setSessionName("");
  //     setSessionDescription("");
  //     setShowCreateSession(false);
  //   };

  async function onSubmit(values: z.infer<typeof sessionSchema>) {
    console.log(values);
    toast(`Session creation attempt: ${values.title}`);

    try {
      const data = values as CreateSessionDto;
      await createSession(data);

      toast.success("✅ Session created successfully");
      form.reset();
      setShowCreateSession(false);
    } catch (error: any) {
      console.error("❌ Session creation failed:", error);
      toast.error("Failed to create session. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Training Session Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage assessment sessions with questions
          </p>
        </div>
        <Dialog open={showCreateSession} onOpenChange={setShowCreateSession}>
          <DialogTrigger asChild>
            <Button className="pau-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Create Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Session</DialogTitle>
              <DialogDescription>
                Create a new training session for assessments.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter session name" {...field} />
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
                      <FormLabel>Session Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe this session..."
                          rows={4}
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
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      form.reset();
                      setShowCreateSession(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="pau-gradient"
                    type="submit"
                    disabled={isPending}
                  >
                    Create Session
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="pau-shadow">
          <CardContent className="p-6 flex items-center">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold">{data.totalSessions}</p>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="pau-shadow">
          <CardContent className="p-6 flex items-center">
            <HelpCircle className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold">{data.totalQuestions}</p>
              <p className="text-sm text-muted-foreground">Total Questions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="pau-shadow">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search sessions by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <Card className="pau-shadow">
        <CardHeader>
          <CardTitle>Training Sessions ({filteredSessions.length})</CardTitle>
          <CardDescription>
            Manage your assessment sessions and their questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="p-6 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{session.title}</h4>
                    <p className="text-muted-foreground mb-3 leading-relaxed">
                      {session.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {/* <div className="flex items-center space-x-2">
                        <Hash className="w-4 h-4 text-[#2e3f6f]" />
                        <span>{session.totalQuestions} Questions</span>
                      </div> */}
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-[#2e3f6f]" />
                        <span>
                          Created:{" "}
                          {new Date(session.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" title="View Questions">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdate(session.id)}
                      title="Edit Session"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(session.id)}
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSessions.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No sessions found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "Create your first training session to get started."}
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span>
              Page {page} of {Math.ceil(data.totalSessions / limit)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page * limit >= data.totalSessions}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
