import { ErrorPage } from "@/global/error";
import { NotFoundPage } from "@/global/not-found";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
  errorComponent: ErrorPage,
  notFoundComponent: NotFoundPage,
});
