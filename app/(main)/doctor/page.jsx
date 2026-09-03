import { TabsContent } from "@/components/ui/tabs";
import { getDoctorAppointments, getDoctorAvailability } from "@/actions/doctor";
import { AvailabilitySettings } from "./_components/availability-settings";
import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { Calendar, Clock, ClipboardList, Stethoscope, CalendarCheck, UserSearch } from "lucide-react";
import DoctorAppointmentsList from "./_components/appointments-list";
import { listReportsForReview, listReviewedReports } from "@/actions/consult";
import { AiReportsList } from "./_components/ai-reports-list";
import { PatientLookup } from "./_components/patient-lookup";
import { DashboardHeader } from "@/components/dashboard-header";
import { StatCard } from "@/components/stat-card";
import { DashboardShell } from "@/components/dashboard-shell";

const NAV_ITEMS = [
  { value: "appointments", label: "Appointments", icon: <Calendar className="h-4 w-4" /> },
  { value: "availability", label: "Availability", icon: <Clock className="h-4 w-4" /> },
  { value: "ai-reports", label: "AI Reports", icon: <ClipboardList className="h-4 w-4" /> },
  { value: "patient-lookup", label: "Patient Lookup", icon: <UserSearch className="h-4 w-4" /> },
];

export default async function DoctorDashboardPage() {
  const user = await getCurrentUser();

  const [appointmentsData, availabilityData, aiReports, reviewedReports] =
    await Promise.all([
      getDoctorAppointments(),
      getDoctorAvailability(),
      listReportsForReview(),
      listReviewedReports(),
    ]);

  if (user?.role !== "DOCTOR") {
    redirect("/onboarding");
  }

  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/doctor/verification");
  }

  const appointments = appointmentsData.appointments || [];
  const todayCount = appointments.filter((a) => {
    const start = new Date(a.startTime);
    const now = new Date();
    return (
      start.getFullYear() === now.getFullYear() &&
      start.getMonth() === now.getMonth() &&
      start.getDate() === now.getDate()
    );
  }).length;

  return (
    <>
      <DashboardHeader
        icon={<Stethoscope className="h-7 w-7" />}
        title="Doctor Dashboard"
        subtitle={`Welcome back, Dr. ${user.name?.split(" ")[0] || ""}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<Calendar className="h-8 w-8 text-emerald-400" />}
          value={appointments.length}
          label="Total Appointments"
          color="emerald"
        />
        <StatCard
          icon={<CalendarCheck className="h-8 w-8 text-blue-400" />}
          value={todayCount}
          label="Today's Appointments"
          color="blue"
        />
        <StatCard
          icon={<ClipboardList className="h-8 w-8 text-red-400" />}
          value={(aiReports || []).length}
          label="AI Reports Pending"
          color="red"
        />
      </div>

      <DashboardShell navItems={NAV_ITEMS} defaultValue="appointments">
        <TabsContent value="appointments" className="border-none p-0 mt-0">
          <DoctorAppointmentsList appointments={appointments} />
        </TabsContent>
        <TabsContent value="availability" className="border-none p-0 mt-0">
          <AvailabilitySettings slots={availabilityData.slots || []} />
        </TabsContent>
        <TabsContent value="ai-reports" className="border-none p-0 mt-0">
          <AiReportsList pending={aiReports || []} reviewed={reviewedReports || []} />
        </TabsContent>
        <TabsContent value="patient-lookup" className="border-none p-0 mt-0">
          <PatientLookup />
        </TabsContent>
      </DashboardShell>
    </>
  );
}
