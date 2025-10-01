"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BookOpen, ArrowLeft, Mail, Loader2 } from "lucide-react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ForgotPasswordInput } from "@/service/interfaces/user.interface";
import { useForgotPassword } from "./api/forgot-password";
import { useNavigate } from "@tanstack/react-router";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(5, { message: "Enter a valid email" })
    .refine((value) => /^\S+@pau\.edu\.ng$/.test(value), {
      message: "Must be a valid PAU email",
    }),
});

export function ForgotPassword() {
  const { mutateAsync: forgotPassword, isPending } = useForgotPassword();
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    toast(`Reset Password attempt with email: ${values.email}`);
    const data = values as ForgotPasswordInput;
    await forgotPassword(data);
    navigate({ to: "/forgot-password-sent" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 pau-gradient rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#2e3f6f]">
            PAU Learning Platform
          </h1>
          <p className="text-gray-600 mt-2">
            Professional Development for Educational Staff
          </p>
        </div>

        {/* Forgot Password Form */}
        <Card className="pau-shadow">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <Mail className="w-5 h-5 mr-2 text-[#2e3f6f]" />
              Reset Your Password
            </CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your
              password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john.smith@pau.edu"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Please use your PAU email address registered with the
                        platform
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-4">
                  <Button
                    type="submit"
                    className="w-full pau-gradient"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending Reset Link...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Reset Link
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate({ to: "/login" })}
                    disabled={isPending}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </div>
              </form>
            </Form>

            {/* Help Section */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-sm text-[#2e3f6f] mb-2">
                Need Help?
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Make sure to use your PAU email address</p>
                <p>• Check your spam/junk folder for the reset email</p>
                <p>
                  • If you don't receive an email within 10 minutes, try again
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Still having trouble? Contact{" "}
                <Button variant="link" className="p-0 h-auto text-[#2e3f6f]">
                  IT Support
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 PAU Learning Platform. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
