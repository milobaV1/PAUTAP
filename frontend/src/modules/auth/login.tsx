import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { decodeToken } from "@/lib/token/decode-token";
import type { LoginInterface } from "@/service/interfaces/user.interface";
import { useAuthState, type DecodedToken } from "@/store/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { getUser, useGetUser } from "./api/get-user";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useGetLogin } from "./api/login";

const loginSchema = z.object({
  email: z.string().min(5, { message: "Enter a valid email" }),
  // .refine((value) => /^\S+@pau\.edu\.ng$/.test(value), {
  //   message: "Must be a valid PAU email",
  // })
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  remember: z.boolean().optional(),
});

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const { mutateAsync: getLogin, isPending, isError } = useGetLogin();
  const { mutateAsync: getUser } = useGetUser();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const { setUser, setAuthToken, setDecodedToken } = useAuthState();
  //const router = useRouter();
  const navigate = useNavigate();
  async function onSubmit(values: z.infer<typeof loginSchema>) {
    console.log(values);
    toast(`Login attempt with email: ${values.email}`);
    const data = values as LoginInterface;
    const token = await getLogin(data);
    console.log("This is the token", token);
    if (token) {
      const payload = decodeToken(
        token.access_token
      ) as unknown as DecodedToken;
      setAuthToken(token.access_token);
      setDecodedToken(payload as unknown as DecodedToken);
      const user = await getUser(payload.sub.id);
      if (user) setUser(user);
      if (payload.sub.roleId === 1) {
        console.log(
          "About to navigate to admin, current state:",
          useAuthState.getState()
        );
        navigate({ to: "/admin" });
      } else {
        console.log(
          "About to navigate to user route, current state:",
          useAuthState.getState()
        );
        navigate({ to: "/" });
      }
    }
    // if (token) {
    //   const payload = decodeToken(
    //     token.access_token
    //   ) as unknown as DecodedToken;
    //   const user = await getUser(payload.sub.id);
    //   if (user) setUser(user);
    //   setAuthToken(token.access_token);
    //   setDecodedToken(payload as unknown as DecodedToken);
    //   //router.history.push();
    //   navigate({ to: "/home" });
    // }
  }

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   //DO SOMETHING
  // };

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

        {/* Login Form */}
        <Card className="pau-shadow">
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to continue your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Email */}
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            {...field}
                            className="pr-10"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Remember me */}
                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      {/* <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-600">
                          Remember me
                        </span>
                      </label> */}
                      <Button
                        variant="link"
                        className="p-0 h-auto text-[#2e3f6f]"
                        onClick={() => navigate({ to: "/forgot-password" })}
                      >
                        Forgot password?
                      </Button>
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full pau-gradient"
                  disabled={isPending}
                >
                  {isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need help? Contact{" "}
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
