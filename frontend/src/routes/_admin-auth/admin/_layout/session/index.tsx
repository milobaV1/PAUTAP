import { TrainingSessionManagement } from "@/modules/admin/features/session-management/session";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin-auth/admin/_layout/session/")({
  component: TrainingSessionManagement,
});
