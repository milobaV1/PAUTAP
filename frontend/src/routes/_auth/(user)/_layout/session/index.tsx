import { sessions } from "@/modules/user/features/assessment/assessment";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/(user)/_layout/session/")({
  component: sessions,
});

function RouteComponent() {
  return <div>Hello "/(user)/_layout/session/"!</div>;
}
