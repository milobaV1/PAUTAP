import { CourseContent } from "@/modules/user/features/course/course";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(user)/_layout/program/$id/course/$courseId/"
)({
  component: CourseContent,
});
