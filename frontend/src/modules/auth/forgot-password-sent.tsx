import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Mail, CheckCircle, Clock } from "lucide-react";

export function ForgotPasswordSent() {
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-green-700">
              Email Sent Successfully!
            </CardTitle>
            <CardDescription>
              We've sent a password reset link to your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instructions */}
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                <h4 className="font-medium text-sm text-green-800 mb-2">
                  What's Next?
                </h4>
                <div className="text-sm text-green-700 space-y-2">
                  <div className="flex items-start">
                    <Mail className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      Check your email inbox for a message from PAU Learning
                      Platform
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Clock className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      Click the reset link within 24 hours (link expires after
                      that)
                    </span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      Follow the instructions to create a new password
                    </span>
                  </div>
                </div>
              </div>

              {/* Email not received section */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-sm text-[#2e3f6f] mb-2">
                  Don't see the email?
                </h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Check your spam, junk, or promotions folder</p>
                  <p>• Make sure you entered the correct email address</p>
                  <p>• The email may take a few minutes to arrive</p>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="text-center pt-4 border-t">
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
