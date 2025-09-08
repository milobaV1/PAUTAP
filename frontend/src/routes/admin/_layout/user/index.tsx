import { UserManagement } from "@/modules/admin/features/user-management/user";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/_layout/user/")({
  component: UserManagement,
});
