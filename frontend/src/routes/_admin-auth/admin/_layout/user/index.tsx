import { UserManagement } from "@/modules/admin/features/user-management/user";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin-auth/admin/_layout/user/")({
  component: UserManagement,
});
