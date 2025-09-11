import { sessions } from "@/modules/user/features/session/session";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(user)/_layout/program/$id/course/$courseId/assessment/$assessmentId"
)({
  component: sessions,
});
