import { QuestionManagement } from "@/modules/admin/features/question-management/question";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin-auth/admin/_layout/question/")({
  component: QuestionManagement,
});
