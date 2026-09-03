import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FileHeart,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Utensils,
  Pill,
  Calendar,
} from "lucide-react";
import { getCurrentUser } from "@/actions/onboarding";
import { listMyConsultations } from "@/actions/consult";
import { listMyPrescriptions } from "@/actions/prescriptions";
import { listMyDietPlans } from "@/actions/diet";
import { getPatientAppointments } from "@/actions/patient";
import { DashboardHeader } from "@/components/dashboard-header";
import { StatCard } from "@/components/stat-card";
import { DashboardShell } from "@/components/dashboard-shell";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PrescriptionView } from "@/components/prescription-view";
import { DietPlanView } from "@/components/diet-plan-view";
import { AppointmentCard } from "@/components/appointment-card";

const RISK_VARIANT = {
  EMERGENCY: "destructive",
  HIGH: "destructive",
  MEDIUM: "secondary",
  LOW: "outline",
};

const NAV_ITEMS = [
  { value: "ai-reports", label: "AI Reports", icon: <ClipboardList className="h-4 w-4" /> },
  { value: "appointments", label: "Appointment History", icon: <Calendar className="h-4 w-4" /> },
  { value: "diet", label: "Diet Recommendations", icon: <Utensils className="h-4 w-4" /> },
  { value: "prescriptions", label: "Prescriptions", icon: <Pill className="h-4 w-4" /> },
];

function ComingSoon({ icon, title, description }) {
  return (
    <Card className="border-emerald-900/20">
      <CardContent className="py-12 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/30 text-muted-foreground">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}

export default async function MyReportsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "PATIENT") {
    redirect("/onboarding");
  }

  const consultations = await listMyConsultations();
  const prescriptions = await listMyPrescriptions();
  const dietPlans = await listMyDietPlans();
  const { appointments } = await getPatientAppointments();
  const withReport = consultations.filter((c) => c.report);

  const awaitingCount = consultations.filter((c) => c.status === "AWAITING_REVIEW").length;
  const reviewedCount = consultations.filter((c) => c.status === "REVIEWED").length;
  const alertCount = withReport.filter(
    (c) => c.report.riskLevel === "HIGH" || c.report.riskLevel === "EMERGENCY"
  ).length;

  return (
    <>
      <DashboardHeader
        icon={<FileHeart className="h-7 w-7" />}
        title="My Health Records"
        subtitle="Your AI symptom checker history"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<ClipboardList className="h-8 w-8 text-emerald-400" />}
          value={consultations.length}
          label="Total Reports"
          color="emerald"
        />
        <StatCard
          icon={<Clock className="h-8 w-8 text-blue-400" />}
          value={awaitingCount}
          label="Awaiting Review"
          color="blue"
        />
        <StatCard
          icon={<CheckCircle2 className="h-8 w-8 text-amber-400" />}
          value={reviewedCount}
          label="Reviewed"
          color="amber"
        />
        <StatCard
          icon={<AlertTriangle className="h-8 w-8 text-red-400" />}
          value={alertCount}
          label="High/Emergency Flags"
          color="red"
        />
      </div>

      <DashboardShell navItems={NAV_ITEMS} defaultValue="ai-reports">
        <TabsContent value="ai-reports" className="border-none p-0 mt-0">
          <Card className="border-emerald-900/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <ClipboardList className="h-5 w-5 mr-2 text-emerald-400" />
                Your AI Symptom Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {consultations.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-xl font-medium text-white mb-2">No reports yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start a chat with the AI Symptom Checker to create your first report.
                  </p>
                  <Link href="/ai-consult" className="text-emerald-400 hover:text-emerald-300 underline text-sm">
                    Start AI consultation
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {consultations.map((c) => (
                    <Link
                      key={c.id}
                      href={c.report ? `/doctor/reports/${c.id}` : "/ai-consult"}
                    >
                      <div className="flex items-center justify-between rounded-lg border p-4 hover:border-emerald-700/50 transition-colors">
                        <div>
                          <p className="font-medium text-white">
                            {c.report?.predictedCategory ?? "In progress"}
                          </p>
                          <p className="text-sm text-muted-foreground">
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
          <Card className="border-emerald-900/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-emerald-400" />
                Your Appointment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!appointments || appointments.length === 0 ? (
                <ComingSoon
                  icon={<Calendar className="h-6 w-6" />}
                  title="No appointments yet"
                  description="Once you book a consultation with a doctor, it'll show up here — including past and cancelled appointments, not just upcoming ones."
                />
              ) : (
                <div className="space-y-4">
                  {[...appointments]
                    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
                    .map((a) => (
                      <AppointmentCard key={a.id} appointment={a} userRole="PATIENT" />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diet" className="border-none p-0 mt-0 space-y-4">
          {dietPlans.length === 0 ? (
            <ComingSoon
              icon={<Utensils className="h-6 w-6" />}
              title="No diet recommendations yet"
              description="Once a doctor reviews one of your AI reports and adds dietary guidance, it'll show up here."
            />
          ) : (
            dietPlans.map((d) => <DietPlanView key={d.id} dietPlan={d} />)
          )}
        </TabsContent>

        <TabsContent value="prescriptions" className="border-none p-0 mt-0 space-y-4">
          {prescriptions.length === 0 ? (
            <ComingSoon
              icon={<Pill className="h-6 w-6" />}
              title="No prescriptions yet"
              description="Once a doctor reviews one of your AI reports and writes a prescription, it'll show up here."
            />
          ) : (
            prescriptions.map((p) => <PrescriptionView key={p.id} prescription={p} />)
          )}
        </TabsContent>
      </DashboardShell>
    </>
  );
}
