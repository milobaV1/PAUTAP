import { Program } from "@/modules/user/features/program/programs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(user)/_layout/program/")({
  component: Program,
});
