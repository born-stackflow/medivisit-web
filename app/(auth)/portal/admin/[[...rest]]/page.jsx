import { SignIn, SignOutButton } from "@clerk/nextjs";
import { ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Admin Portal - MediVisit",
  description: "Sign in to the admin dashboard",
};

export default async function AdminPortalPage() {
  const user = await getCurrentUser();

  if (user) {
    if (user.role === "ADMIN") {
      redirect("/admin");
    }

    return (
      <Card className="border-emerald-900/20 w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            Admin Portal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            This account isn&apos;t registered as an admin. Sign out and sign
            in with an admin account.
          </p>
          <SignOutButton redirectUrl="/portal/admin">
            <Button variant="outline" className="w-full">
              Sign out
            </Button>
          </SignOutButton>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 text-emerald-400">
        <ShieldCheck className="h-6 w-6" />
        <span className="text-sm font-medium uppercase tracking-wide">Admin Portal</span>
      </div>
      <SignIn
        fallbackRedirectUrl="/portal/admin"
        appearance={{
          elements: {
            // No self-serve signup from this portal — admin accounts are
            // promoted manually, never created here.
            footerAction: { display: "none" },
          },
        }}
        localization={{
          signIn: {
            start: {
              title: "Admin sign in",
              subtitle: "Access the MediVisit admin dashboard",
            },
          },
        }}
      />
    </div>
  );
}
