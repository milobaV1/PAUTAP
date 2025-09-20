import { ResetPassword } from "@/modules/auth/reset-password";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

export const Route = createFileRoute("/(auth)/reset-password")({
  component: ResetPassword,
  validateSearch: z.object({
    token: z.string().optional(),
  }),
});
