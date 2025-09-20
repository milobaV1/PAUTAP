import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, CheckCircle, LogIn, Shield } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function ResetPasswordSuccess() {
  const navigate = useNavigate();
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

        {/* Success Message */}
        <Card className="pau-shadow">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-green-700 text-xl">
              Password Updated Successfully!
            </CardTitle>
            <CardDescription>
              Your password has been reset and your account is now secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Success Details */}
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                <h4 className="font-medium text-sm text-green-800 mb-2">
                  What Happened:
                </h4>
                <div className="text-sm text-green-700 space-y-2">
                  <div className="flex items-start">
                    <Shield className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Your password has been successfully updated</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      Your account is now secure with the new password
                    </span>
                  </div>
                  <div className="flex items-start">
                    <LogIn className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>You can now sign in using your new password</span>
                  </div>
                </div>
              </div>

              {/* Security Tips */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-sm text-[#2e3f6f] mb-2">
                  Security Tips:
                </h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>
                    • Keep your password safe and don't share it with anyone
                  </p>
                  <p>• Consider using a password manager for better security</p>
                  <p>
                    • If you suspect unauthorized access, change your password
                    immediately
                  </p>
                  <p>• Sign out from shared computers after use</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="space-y-3">
              <Button
                className="w-full pau-gradient text-lg py-6"
                onClick={() => navigate({ to: "/login" })}
              >
                <LogIn className="w-5 h-5 mr-2" />
                Continue to Login
              </Button>
            </div>

            {/* Additional Help */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Need help accessing your account? Contact{" "}
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
