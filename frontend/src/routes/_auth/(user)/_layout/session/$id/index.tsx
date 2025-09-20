import { CategorySelection } from "@/modules/user/features/assessment/categories";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/(user)/_layout/session/$id/")({
  component: CategorySelection,
});

function RouteComponent() {
  return <div>Hello "/(user)/_layout/session/$id/"!</div>;
}
