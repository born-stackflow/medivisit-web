export const metadata = {
  title: "Doctor Dashboard - MediVisit",
  description: "Manage your appointments and availability",
};

export default async function DoctorDashboardLayout({ children }) {
  return <div className="container mx-auto px-4 py-8">{children}</div>;
}
