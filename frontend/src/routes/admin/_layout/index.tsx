import { AdminHome } from "@/modules/admin/features/home/home";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/_layout/")({
  component: AdminHome,
});
