import { ForgotPasswordSent } from "@/modules/auth/forgot-password-sent";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/forgot-password-sent")({
  component: ForgotPasswordSent,
});
