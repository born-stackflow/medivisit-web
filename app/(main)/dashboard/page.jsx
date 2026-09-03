import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Calendar,
  ClipboardList,
  Pill,
  User,
  Zap,
  MessageCircleHeart,
  FileHeart,
  LifeBuoy,
} from "lucide-react";
import { getCurrentUser } from "@/actions/onboarding";
import { listMyConsultations } from "@/actions/consult";
import { listMyPrescriptions } from "@/actions/prescriptions";
import { getPatientAppointments } from "@/actions/patient";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function PatientDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "PATIENT") {
    redirect("/onboarding");
  }

  const [consultations, prescriptions, { appointments }] = await Promise.all([
    listMyConsultations(),
    listMyPrescriptions(),
    getPatientAppointments(),
  ]);

  const firstName = user.name?.split(" ")[0] || "there";
  const initial = (user.name?.[0] || user.email?.[0] || "?").toUpperCase();
  const memberSince = new Date(user.createdAt).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="border-emerald-900/20 mb-6">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-emerald-600 flex items-center justify-center text-2xl font-bold text-white shrink-0">
            {initial}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {firstName}!
            </h1>
            <p className="text-muted-foreground">
              Manage your appointments, AI reports, and health records
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<Calendar className="h-8 w-8 text-emerald-400" />}
          value={appointments?.length ?? 0}
          label="Total Appointments"
          color="emerald"
        />
        <StatCard
          icon={<ClipboardList className="h-8 w-8 text-blue-400" />}
          value={consultations.length}
          label="AI Reports"
          color="blue"
        />
        <StatCard
          icon={<Pill className="h-8 w-8 text-amber-400" />}
          value={prescriptions.length}
          label="Prescriptions"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-emerald-900/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-emerald-400" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-muted/30 pb-2">
              <span className="text-muted-foreground">Full Name</span>
              <span className="text-white font-medium">{user.name}</span>
            </div>
            <div className="flex justify-between border-b border-muted/30 pb-2">
              <span className="text-muted-foreground">Email Address</span>
              <span className="text-white font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member Since</span>
              <span className="text-white font-medium">{memberSince}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-900/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-emerald-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start bg-emerald-600 hover:bg-emerald-700">
              <Link href="/ai-consult">
                <MessageCircleHeart className="h-4 w-4 mr-2" />
                Start AI Symptom Checker
              </Link>
            </Button>
            <Button asChild className="w-full justify-start bg-blue-600 hover:bg-blue-700">
              <Link href="/doctors">
                <Calendar className="h-4 w-4 mr-2" />
                Book New Appointment
              </Link>
            </Button>
            <Button asChild className="w-full justify-start bg-violet-600 hover:bg-violet-700">
              <Link href="/my-reports">
                <FileHeart className="h-4 w-4 mr-2" />
                View My Health Records
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start border-emerald-900/30">
              <Link href="mailto:support@medivisit.example">
                <LifeBuoy className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
