import { Assessments } from "@/modules/user/features/assessment/assessment";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(user)/_layout/assessment/")({
  component: Assessments,
});

function RouteComponent() {
  return <div>Hello "/(user)/_layout/assessment/"!</div>;
}
