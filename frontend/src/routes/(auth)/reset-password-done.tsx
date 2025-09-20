import { ResetPasswordSuccess } from "@/modules/auth/reset-password-done";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/reset-password-done")({
  component: ResetPasswordSuccess,
});
