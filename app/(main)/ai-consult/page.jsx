import { redirect } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { getCurrentUser } from "@/actions/onboarding";
import { getOrCreateConsultation } from "@/actions/consult";
import { PageHeader } from "@/components/page-header";
import { ChatWindow } from "@/components/chat-window";

export const metadata = {
  title: "AI Symptom Checker - MediVisit",
  description: "Describe your symptoms to the AI Doctor before seeing a real one",
};

export default async function AiConsultPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "PATIENT") {
    redirect("/onboarding");
  }

  const consultation = await getOrCreateConsultation();

  const initialMessages = consultation.messages.map((m) => ({
    sender: m.sender,
    content: m.content,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        icon={<Stethoscope />}
        title="AI Symptom Checker"
        backLink="/doctors"
        backLabel="Find Doctors"
      />
      <p className="text-muted-foreground mb-6 max-w-2xl">
        This is not a diagnosis. If you are describing a medical emergency,
        call 999 now instead of using this chat.
      </p>
      <ChatWindow
        consultationId={consultation.id}
        initialMessages={initialMessages}
        initialReportReady={consultation.status !== "IN_PROGRESS"}
      />
    </div>
  );
}
