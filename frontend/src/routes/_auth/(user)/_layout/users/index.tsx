import { Staff } from "@/modules/user/features/users/user";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/(user)/_layout/users/")({
  component: Staff,
});
