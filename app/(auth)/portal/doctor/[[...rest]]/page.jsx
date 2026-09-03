import { SignIn, SignOutButton } from "@clerk/nextjs";
import { Stethoscope } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Doctor Portal - MediVisit",
  description: "Sign in to the doctor dashboard",
};

export default async function DoctorPortalPage() {
  const user = await getCurrentUser();

  if (user) {
    if (user.role === "DOCTOR") {
      redirect("/doctor");
    }

    return (
      <Card className="border-emerald-900/20 w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-emerald-400" />
            Doctor Portal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            This account isn&apos;t registered as a doctor. Sign out and sign
            in with a doctor account, or contact an admin if you believe this
            is a mistake.
          </p>
          <SignOutButton redirectUrl="/portal/doctor">
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
        <Stethoscope className="h-6 w-6" />
        <span className="text-sm font-medium uppercase tracking-wide">Doctor Portal</span>
      </div>
      <SignIn
        fallbackRedirectUrl="/portal/doctor"
        appearance={{
          elements: {
            // No self-serve signup from this portal — doctors get their
            // account via the normal /sign-up + onboarding flow.
            footerAction: { display: "none" },
          },
        }}
        localization={{
          signIn: {
            start: {
              title: "Doctor sign in",
              subtitle: "Access your MediVisit doctor dashboard",
            },
          },
        }}
      />
    </div>
  );
}
