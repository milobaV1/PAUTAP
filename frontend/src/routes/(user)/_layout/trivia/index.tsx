import { Trivia } from "@/modules/user/features/trivia/trivia";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(user)/_layout/trivia/")({
  component: Trivia,
});
