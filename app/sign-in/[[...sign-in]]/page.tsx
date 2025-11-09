import { SignIn } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const isUnauthorized = params.error === "unauthorized";
  const isConfigError = params.error === "config";

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <div className="w-full max-w-md">
        {isConfigError && (
          <Card className="mb-4 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Configuration Error</CardTitle>
              <CardDescription>
                EMAILS environment variable is not configured. Please contact the administrator.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
        {isUnauthorized && (
          <Card className="mb-4 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Access Denied</CardTitle>
              <CardDescription>
                Your email is not authorized to access this application. Only emails listed in the EMAILS environment variable are allowed.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <SignIn
                appearance={{
                  elements: {
                    rootBox: "mx-auto",
                    card: "shadow-none",
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

