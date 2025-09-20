import { SessionTaking } from "@/modules/user/features/assessment/assessment-taking";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_auth/(user)/_layout/session/$id/category/$categoryId/"
)({
  component: SessionTaking,
});

function RouteComponent() {
  return <div>Hello "/(user)/_layout/session/$id/category/$id/"!</div>;
}
