import { AlertTriangle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";

export function ErrorPage({ error }: { error: Error }) {
  const navigate = useNavigate();
  const handleGoHome = () => {
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pau-blue-lighter to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="pau-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-pau-error/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-pau-error" />
            </div>
            <CardTitle className="text-pau-blue">
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                We encountered an error while processing your request.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-pau-error">
                <p className="text-sm text-foreground break-words">
                  {error.message}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleGoHome}
                className="w-full bg-pau-blue hover:bg-pau-blue-light"
              >
                <Home className="w-4 h-4 mr-2" />
                Return to Home
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full border-pau-blue text-pau-blue hover:bg-pau-blue-lighter"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
