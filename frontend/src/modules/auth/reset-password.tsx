"use client";
import { useState, useEffect } from "react";
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
  BookOpen,
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  AlertCircle,
  Shield,
  Loader2,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useResetPassword } from "./api/reset-password";
import type { ResetPasswordInput } from "@/service/interfaces/user.interface";
import { toast } from "sonner";

const formSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export function ResetPassword() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [] as string[],
  });

  const search = useSearch({ from: "/(auth)/reset-password" });
  const token = search.token;
  const { mutateAsync: resetPassword, isPending } = useResetPassword();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const navigate = useNavigate();

  // Password strength checker
  const newPassword = form.watch("newPassword");

  useEffect(() => {
    const checkPasswordStrength = (password: string) => {
      const feedback = [];
      let score = 0;

      if (password.length >= 8) {
        score += 1;
      } else if (password.length > 0) {
        feedback.push("Use at least 8 characters");
      }

      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
        score += 1;
      } else if (password.length > 0) {
        feedback.push("Include both upper and lowercase letters");
      }

      if (/\d/.test(password)) {
        score += 1;
      } else if (password.length > 0) {
        feedback.push("Include at least one number");
      }

      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        score += 1;
      } else if (password.length > 0) {
        feedback.push("Include at least one special character");
      }

      setPasswordStrength({ score, feedback });
    };

    checkPasswordStrength(newPassword);
  }, [newPassword]);

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-yellow-500";
    if (score <= 3) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (score: number) => {
    if (score <= 1) return "Weak";
    if (score <= 2) return "Fair";
    if (score <= 3) return "Good";
    return "Strong";
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    if (!token) {
      toast.error("Token needed");
      return;
    }
    const data: ResetPasswordInput = {
      token,
      password: values.newPassword,
    };

    await resetPassword(data, {
      onSuccess: () => {
        navigate({ to: "/reset-password-done" });
      },
      onError: (error) => {
        toast.error(error.message || "Something went wrong");
      },
    });
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

        {/* Reset Password Form */}
        <Card className="pau-shadow">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <Shield className="w-5 h-5 mr-2 text-[#2e3f6f]" />
              Set New Password
            </CardTitle>
            <CardDescription>
              Create a strong password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* New Password */}
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter your new password"
                            className="w-full pr-10"
                            disabled={isPending}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />

                      {/* Password Strength Indicator */}
                      {field.value && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>Password strength:</span>
                            <span
                              className={`font-medium ${
                                passwordStrength.score <= 1
                                  ? "text-red-600"
                                  : passwordStrength.score <= 2
                                    ? "text-yellow-600"
                                    : passwordStrength.score <= 3
                                      ? "text-blue-600"
                                      : "text-green-600"
                              }`}
                            >
                              {getPasswordStrengthText(passwordStrength.score)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                              style={{
                                width: `${(passwordStrength.score / 4) * 100}%`,
                              }}
                            />
                          </div>
                          {passwordStrength.feedback.length > 0 && (
                            <ul className="text-xs text-gray-600 space-y-1">
                              {passwordStrength.feedback.map((item, index) => (
                                <li key={index} className="flex items-center">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your new password"
                            className="w-full pr-10"
                            disabled={isPending}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />

                      {/* Password Match Indicator */}
                      {field.value && (
                        <div className="flex items-center text-xs">
                          {form.getValues("newPassword") === field.value ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
                              <span className="text-green-600">
                                Passwords match
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 text-red-600 mr-1" />
                              <span className="text-red-600">
                                Passwords don't match
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full pau-gradient"
                  disabled={
                    isPending ||
                    form.watch("newPassword") !==
                      form.watch("confirmPassword") ||
                    passwordStrength.score < 3
                  }
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Update Password
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Security Note */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-sm text-[#2e3f6f] mb-2">
                Security Requirements:
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Minimum 8 characters long</p>
                <p>• Include uppercase and lowercase letters</p>
                <p>• Include at least one number</p>
                <p>• Include at least one special character</p>
              </div>
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
