import { ModuleDetail } from "@/modules/user/features/program/program-detail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(user)/_layout/program/$id/")({
  component: ModuleDetail,
});
