import { isAdmin } from "@/utils/auth-extension";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin-auth")({
  beforeLoad: async ({ location }) => {
    if (!isAdmin()) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
});

function RouteComponent() {
  return <div>Hello "/_admin"!</div>;
}
