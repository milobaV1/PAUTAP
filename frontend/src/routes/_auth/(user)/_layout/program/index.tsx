import { Program } from "@/modules/user/features/program/programs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/(user)/_layout/program/")({
  component: Program,
});
