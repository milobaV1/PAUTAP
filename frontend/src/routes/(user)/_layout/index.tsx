import { Home } from "@/modules/user/features/home/home";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(user)/_layout/")({
  component: Home,
});
