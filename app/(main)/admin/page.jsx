import { TabsContent } from "@/components/ui/tabs";
import { PendingDoctors } from "./components/pending-doctors";
import { VerifiedDoctors } from "./components/verified-doctors";
import { AiTriageOversight } from "./components/ai-triage-oversight";
import {
  getPendingDoctors,
  getVerifiedDoctors,
  getAllAiReports,
  getAdminOverviewStats,
} from "@/actions/admin";
import { DashboardHeader } from "@/components/dashboard-header";
import { StatCard } from "@/components/stat-card";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  ShieldCheck,
  AlertCircle,
  Users,
  ClipboardList,
  CalendarCheck,
  Stethoscope,
  HeartPulse,
} from "lucide-react";

const NAV_ITEMS = [
  { value: "pending", label: "Pending Verification", icon: <AlertCircle className="h-4 w-4" /> },
  { value: "doctors", label: "Doctors", icon: <Users className="h-4 w-4" /> },
  { value: "ai-triage", label: "AI Triage", icon: <ClipboardList className="h-4 w-4" /> },
];

export default async function AdminPage() {
  const [pendingDoctorsData, verifiedDoctorsData, aiReportsData, overview] =
    await Promise.all([
      getPendingDoctors(),
      getVerifiedDoctors(),
      getAllAiReports(),
      getAdminOverviewStats(),
    ]);

  return (
    <>
      <DashboardHeader
        icon={<ShieldCheck className="h-7 w-7" />}
        title="Admin Dashboard"
        subtitle="Platform-wide oversight"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<CalendarCheck className="h-8 w-8 text-emerald-400" />}
          value={overview.totalAppointments}
          label="Total Appointments"
          color="emerald"
        />
        <StatCard
          icon={<Users className="h-8 w-8 text-blue-400" />}
          value={overview.totalUsers}
          label="Registered Users"
          color="blue"
        />
        <StatCard
          icon={<Stethoscope className="h-8 w-8 text-amber-400" />}
          value={overview.totalDoctors}
          label="Verified Doctors"
          color="amber"
        />
        <StatCard
          icon={<HeartPulse className="h-8 w-8 text-red-400" />}
          value={(aiReportsData.stats?.byRiskLevel?.EMERGENCY) || 0}
          label="Emergency Flags"
          color="red"
        />
      </div>

      <DashboardShell navItems={NAV_ITEMS} defaultValue="pending">
        <TabsContent value="pending" className="border-none p-0 mt-0">
          <PendingDoctors doctors={pendingDoctorsData.doctors || []} />
        </TabsContent>

        <TabsContent value="doctors" className="border-none p-0 mt-0">
          <VerifiedDoctors doctors={verifiedDoctorsData.doctors || []} />
        </TabsContent>

        <TabsContent value="ai-triage" className="border-none p-0 mt-0">
          <AiTriageOversight
            consultations={aiReportsData.consultations || []}
            stats={aiReportsData.stats}
          />
        </TabsContent>
      </DashboardShell>
    </>
  );
}
