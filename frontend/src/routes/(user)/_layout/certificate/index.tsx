import { Certificates } from "@/modules/user/features/certificate/certificate";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(user)/_layout/certificate/")({
  component: Certificates,
});
