import { Assessments } from "@/modules/user/features/assessment/assessment";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(user)/_layout/program/$id/course/$courseId/assessment/$assessmentId"
)({
  component: Assessments,
});
