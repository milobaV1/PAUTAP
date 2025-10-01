import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";

export function NotFoundPage() {
  const navigate = useNavigate();
  const handleGoHome = () => {
    navigate({ to: "/" });
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pau-blue-lighter to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="pau-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-20 h-20 bg-pau-blue/10 rounded-full flex items-center justify-center">
              <FileQuestion className="w-10 h-10 text-pau-blue" />
            </div>
            <CardTitle className="text-pau-blue text-2xl">
              404 - Page Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <div className="bg-pau-blue-lighter/30 rounded-lg p-4">
                <p className="text-sm text-pau-blue">
                  Don't worry, you can easily navigate back to your learning
                  dashboard.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleGoHome}
                className="w-full bg-pau-blue hover:bg-pau-blue-light"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={handleGoBack}
                className="w-full border-pau-blue text-pau-blue hover:bg-pau-blue-lighter"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
