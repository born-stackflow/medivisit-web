import { redirect } from "next/navigation";
import Link from "next/link";
import {
  User,
  ClipboardList,
  Calendar,
  Pill,
  Utensils,
  FileText,
} from "lucide-react";
import { getCurrentUser } from "@/actions/onboarding";
import { getPatientHistory } from "@/actions/consult";
import {
  getPatientBasicInfo,
  getPatientAppointmentHistory,
  getPatientPrescriptionHistory,
  getPatientDietPlanHistory,
} from "@/actions/patient-history";
import { DashboardHeader } from "@/components/dashboard-header";
import { StatCard } from "@/components/stat-card";
import { DashboardShell } from "@/components/dashboard-shell";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskDistributionBar } from "@/components/risk-distribution-bar";
import { AppointmentCard } from "@/components/appointment-card";
import { PrescriptionView } from "@/components/prescription-view";
import { DietPlanView } from "@/components/diet-plan-view";

const RISK_VARIANT = {
  EMERGENCY: "destructive",
  HIGH: "destructive",
  MEDIUM: "secondary",
  LOW: "outline",
};

const NAV_ITEMS = [
  { value: "ai-reports", label: "AI Reports", icon: <ClipboardList className="h-4 w-4" /> },
  { value: "appointments", label: "Appointments", icon: <Calendar className="h-4 w-4" /> },
  { value: "prescriptions", label: "Prescriptions", icon: <Pill className="h-4 w-4" /> },
  { value: "diet", label: "Diet Plans", icon: <Utensils className="h-4 w-4" /> },
];

function EmptyState({ text }) {
  return <p className="text-muted-foreground text-sm text-center py-8">{text}</p>;
}

export default async function PatientHistoryPage({ params }) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
    redirect("/onboarding");
  }

  let patient;
  try {
    patient = await getPatientBasicInfo(id);
  } catch (error) {
    console.error("Failed to load patient:", error);
    redirect(user.role === "ADMIN" ? "/admin" : "/doctor");
  }

  const [reportHistory, appointments, prescriptions, dietPlans] = await Promise.all([
    getPatientHistory(id),
    getPatientAppointmentHistory(id),
    getPatientPrescriptionHistory(id),
    getPatientDietPlanHistory(id),
  ]);

  const riskCounts = reportHistory.reduce((acc, c) => {
    const level = c.report?.riskLevel;
    if (level) acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader
        icon={<User className="h-7 w-7" />}
        title={patient.name ?? patient.email}
        subtitle={`${patient.email} · Patient since ${new Date(patient.createdAt).toLocaleDateString()}`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<ClipboardList className="h-8 w-8 text-emerald-400" />}
          value={reportHistory.length}
          label="AI Reports"
          color="emerald"
        />
        <StatCard
          icon={<Calendar className="h-8 w-8 text-blue-400" />}
          value={appointments.length}
          label="Appointments"
          color="blue"
        />
        <StatCard
          icon={<Pill className="h-8 w-8 text-amber-400" />}
          value={prescriptions.length}
          label="Prescriptions"
          color="amber"
        />
        <StatCard
          icon={<Utensils className="h-8 w-8 text-red-400" />}
          value={dietPlans.length}
          label="Diet Plans"
          color="red"
        />
      </div>

      <DashboardShell navItems={NAV_ITEMS} defaultValue="ai-reports">
        <TabsContent value="ai-reports" className="border-none p-0 mt-0">
          <Card className="border-emerald-900/20">
            <CardHeader>
              <CardTitle>Risk Pattern</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RiskDistributionBar counts={riskCounts} />
              {reportHistory.length === 0 ? (
                <EmptyState text="No AI reports for this patient yet." />
              ) : (
                <div className="space-y-2 text-sm">
                  {reportHistory.map((c) => (
                    <Link key={c.id} href={`/doctor/reports/${c.id}`}>
                      <div className="flex items-center justify-between rounded-lg border p-3 hover:border-emerald-700/50 transition-colors">
                        <div>
                          <p className="text-white">{c.report?.predictedCategory}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(c.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{c.status.replace("_", " ")}</Badge>
                          {c.report && (
                            <Badge variant={RISK_VARIANT[c.report.riskLevel] ?? "outline"}>
                              {c.report.riskLevel}
                            </Badge>
                          )}
                          <FileText className="h-3.5 w-3.5 text-emerald-400" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="border-none p-0 mt-0">
          {appointments.length === 0 ? (
            <Card className="border-emerald-900/20">
              <CardContent>
                <EmptyState text="No appointments for this patient yet." />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {appointments.map((a) => (
                <AppointmentCard key={a.id} appointment={a} userRole="DOCTOR" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="prescriptions" className="border-none p-0 mt-0 space-y-4">
          {prescriptions.length === 0 ? (
            <Card className="border-emerald-900/20">
              <CardContent>
                <EmptyState text="No prescriptions for this patient yet." />
              </CardContent>
            </Card>
          ) : (
            prescriptions.map((p) => <PrescriptionView key={p.id} prescription={p} />)
          )}
        </TabsContent>

        <TabsContent value="diet" className="border-none p-0 mt-0 space-y-4">
          {dietPlans.length === 0 ? (
            <Card className="border-emerald-900/20">
              <CardContent>
                <EmptyState text="No diet plans for this patient yet." />
              </CardContent>
            </Card>
          ) : (
            dietPlans.map((d) => <DietPlanView key={d.id} dietPlan={d} showAiBadge />)
          )}
        </TabsContent>
      </DashboardShell>
    </div>
  );
}
