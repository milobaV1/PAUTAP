import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  AlertCircle,
  Shield,
  Loader2,
  User,
} from "lucide-react";
import { useAuthState } from "@/store/auth.store";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useVerifyPassword } from "./api/verify-password";
import { useUpdatePassword } from "./api/update-password";
import type {
  UpdatePasswordDto,
  VerifyPasswordDto,
} from "@/service/interfaces/user.interface";
import { toast } from "sonner";

const currentPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
});

const formSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export function Profile() {
  const [step, setStep] = useState<1 | 2>(1);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  //const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [] as string[],
  });

  const { mutateAsync: verify, isPending: pendingVerification } =
    useVerifyPassword();

  const { mutateAsync: update, isPending: pendingUpdate } = useUpdatePassword();

  const { user } = useAuthState();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const currentPasswordForm = useForm<z.infer<typeof currentPasswordSchema>>({
    resolver: zodResolver(currentPasswordSchema),
    defaultValues: {
      currentPassword: "",
    },
  });

  if (!user) return <div>Loading...</div>;
  // Password strength checker
  // REPLACE the existing useEffect with:
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

    const subscription = form.watch((value) => {
      if (value.newPassword) {
        checkPasswordStrength(value.newPassword);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);
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

  const handleVerifyCurrentPassword = async (
    values: z.infer<typeof currentPasswordSchema>
  ) => {
    setSuccessMessage("");
    setErrorMessage("");
    const { currentPassword } = values;

    const value: VerifyPasswordDto = {
      password: currentPassword,
    };

    const userId = user.id;

    try {
      const result = await verify({ id: userId, password: value });

      if (result) {
        setStep(2);
      } else {
        currentPasswordForm.setError("currentPassword", {
          type: "manual",
          message: "Current password is incorrect",
        });
        toast.error("Current password is incorrect");
      }
    } catch (error: any) {
      currentPasswordForm.setError("currentPassword", {
        type: "manual",
        message: "Current password is incorrect",
      });
      toast.error(error.message || "Something went wrong");
    }
  };
  const handleUpdatePassword = async (values: z.infer<typeof formSchema>) => {
    setSuccessMessage("");
    setErrorMessage("");
    // Validate password strength
    if (passwordStrength.score < 3) {
      setErrorMessage("Please create a stronger password");
      return;
    }

    const { newPassword } = values;
    const value: UpdatePasswordDto = {
      newPassword,
    };

    const userId = user.id;
    await update(
      { id: userId, password: value },
      {
        onSuccess: () => {
          setSuccessMessage("Password updated successfully!");
          currentPasswordForm.reset(); // ADD THIS LINE
          form.reset();
          setStep(1);
        },
        onError: (error) => {
          toast.error(error.message || "Something went wrong");
        },
      }
    );

    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  const handleBackToStep1 = () => {
    setStep(1);
    form.reset();
    currentPasswordForm.reset();
    setErrorMessage("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#2e3f6f]">Profile</h1>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Account Information Card */}
      <Card className="pau-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2 text-[#2e3f6f]" />
            Account Information
          </CardTitle>
          <CardDescription>Your basic account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">Name</Label>
              <p className="text-gray-900 mt-1 capitalize">{`${user.first_name} ${user.last_name}`}</p>
            </div>
            <div>
              <Label className="text-gray-600">Email</Label>
              <p className="text-gray-900 mt-1">{user.email}</p>
            </div>
            <div>
              <Label className="text-gray-600">Role</Label>
              <p className="text-gray-900 mt-1">{user.role.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card className="pau-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-[#2e3f6f]" />
            Change Password
          </CardTitle>
          <CardDescription>
            {step === 1
              ? "Verify your current password to continue"
              : "Create a new secure password for your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step === 1
                    ? "pau-gradient text-white"
                    : "bg-green-500 text-white"
                }`}
              >
                {step === 2 ? <CheckCircle className="w-5 h-5" /> : "1"}
              </div>
              <div
                className={`w-16 h-0.5 ${step === 2 ? "bg-green-500" : "bg-gray-300"}`}
              />
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step === 2
                    ? "pau-gradient text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                2
              </div>
            </div>
          </div>

          {/* Step 1: Verify Current Password */}
          {/* Step 1: Verify Current Password */}
          {step === 1 && (
            <Form {...currentPasswordForm}>
              <form
                onSubmit={currentPasswordForm.handleSubmit(
                  handleVerifyCurrentPassword
                )}
                className="space-y-6"
              >
                <FormField
                  control={currentPasswordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Enter your current password"
                            disabled={pendingVerification}
                            {...field}
                            className="w-full pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            tabIndex={-1}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full pau-gradient"
                  disabled={
                    pendingVerification ||
                    !currentPasswordForm.formState.isValid
                  }
                >
                  {pendingVerification ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify & Continue
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}

          {step === 2 && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleUpdatePassword)}
                className="space-y-6"
              >
                {/* Current Password Verified */}
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Current password verified successfully
                  </AlertDescription>
                </Alert>

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
                            disabled={pendingUpdate}
                            {...field}
                            className="w-full pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            tabIndex={-1}
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
                            disabled={pendingUpdate}
                            {...field}
                            className="w-full pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            tabIndex={-1}
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

                {/* Security Requirements */}
                <div className="p-4 bg-blue-50 rounded-lg">
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

                {/* Submit Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1 pau-gradient"
                    disabled={
                      pendingUpdate ||
                      passwordStrength.score < 3 ||
                      !form.formState.isValid
                    }
                  >
                    {pendingUpdate ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Update Password
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackToStep1}
                    disabled={pendingUpdate}
                  >
                    Back
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
