import { CategorySelection } from "@/modules/user/features/assessment/categories";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(user)/_layout/assessment/$id/")({
  component: CategorySelection,
});

function RouteComponent() {
  return <div>Hello "/(user)/_layout/assessment/$id/"!</div>;
}
