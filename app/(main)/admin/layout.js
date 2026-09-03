import { verifyAdmin } from "@/actions/admin";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Dashboard - MediVisit",
  description: "Manage doctors, patients, and platform settings",
};

export default async function AdminLayout({ children }) {
  const isAdmin = await verifyAdmin();

  if (!isAdmin) {
    redirect("/onboarding");
  }

  return <div className="container mx-auto px-4 py-8">{children}</div>;
}
