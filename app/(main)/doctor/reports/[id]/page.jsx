import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, History } from "lucide-react";
import { getCurrentUser } from "@/actions/onboarding";
import { getConsultationDetail, getPatientHistory } from "@/actions/consult";
import { getPrescriptionForConsultation } from "@/actions/prescriptions";
import { getDietPlanForConsultation } from "@/actions/diet";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageBubble } from "@/components/message-bubble";
import { RiskDistributionBar } from "@/components/risk-distribution-bar";
import { ReviewButton } from "./review-button";
import { PrescriptionForm } from "./prescription-form";
import { PrescriptionView } from "@/components/prescription-view";
import { DietPlanForm } from "./diet-plan-form";
import { DietPlanView } from "@/components/diet-plan-view";

const RISK_VARIANT = {
  EMERGENCY: "destructive",
  HIGH: "destructive",
  MEDIUM: "secondary",
  LOW: "outline",
};

const FALLBACK_PATH = { ADMIN: "/admin", DOCTOR: "/doctor", PATIENT: "/my-reports" };
const FALLBACK_LABEL = { ADMIN: "Admin Dashboard", DOCTOR: "Doctor Dashboard", PATIENT: "My Reports" };

export default async function DoctorReportDetailPage({ params }) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/onboarding");
  }

  const fallbackPath = FALLBACK_PATH[user.role] ?? "/onboarding";

  let consultation;
  try {
    consultation = await getConsultationDetail(id);
  } catch (error) {
    console.error("Failed to load consultation:", error);
    redirect(fallbackPath);
  }

  const isReviewer = user.role === "DOCTOR" || user.role === "ADMIN";
  const history = isReviewer ? await getPatientHistory(consultation.patientId) : null;
  const prescription = await getPrescriptionForConsultation(consultation.id);
  const dietPlan = await getDietPlanForConsultation(consultation.id);
  const riskCounts = (history || []).reduce((acc, c) => {
    const level = c.report?.riskLevel;
    if (level) acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const { report, messages, patient, status } = consultation;

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        icon={<FileText />}
        title="AI Symptom Report"
        backLink={fallbackPath}
        backLabel={FALLBACK_LABEL[user.role] ?? "Home"}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-emerald-900/20 lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{patient?.name ?? patient?.email}</span>
              {report && (
                <Badge variant={RISK_VARIANT[report.riskLevel] ?? "outline"}>
                  {report.riskLevel}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {report ? (
              <>
                <div>
                  <p className="text-muted-foreground mb-1">Summary</p>
                  <p>{report.summary}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Extracted symptoms</p>
                  <p>{Array.isArray(report.extractedSymptoms) ? report.extractedSymptoms.join(", ") : String(report.extractedSymptoms)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Predicted category</p>
                  <p>
                    {report.predictedCategory} ({Math.round(report.confidence * 100)}% confidence)
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Recommended action</p>
                  <p>{report.recommendedAction}</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No structured report yet — chat still in progress.</p>
            )}

            {user.role === "DOCTOR" && status === "AWAITING_REVIEW" && (
              <ReviewButton consultationId={consultation.id} />
            )}
            {status === "REVIEWED" && (
              <p className="text-emerald-400 text-sm font-medium">Marked as reviewed.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-emerald-900/20 lg:col-span-2">
          <CardHeader>
            <CardTitle>Full transcript</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[70vh] overflow-y-auto">
            {messages.map((m) => (
              <MessageBubble key={m.id} sender={m.sender} content={m.content} />
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {prescription ? (
            <PrescriptionView prescription={prescription} />
          ) : user.role === "DOCTOR" ? (
            <PrescriptionForm consultationId={consultation.id} />
          ) : (
            <div />
          )}

          {dietPlan ? (
            <DietPlanView dietPlan={dietPlan} showAiBadge={isReviewer} />
          ) : user.role === "DOCTOR" ? (
            <DietPlanForm consultationId={consultation.id} />
          ) : null}
        </div>

        {isReviewer && (
        <Card className="border-emerald-900/20 lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center">
              <History className="h-5 w-5 mr-2 text-emerald-400" />
              Patient Risk Pattern
            </CardTitle>
            <Link
              href={`/doctor/patients/${consultation.patientId}`}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline"
            >
              View full patient history →
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <RiskDistributionBar counts={riskCounts} />

            <div className="space-y-2 text-sm">
              {history.map((c) => (
                <div
                  key={c.id}
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    c.id === consultation.id ? "border-emerald-700/60 bg-emerald-950/20" : ""
                  }`}
                >
                  <div>
                    <p className="text-white">{c.report?.predictedCategory}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleString()}
                      {c.id === consultation.id && " — this report"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={RISK_VARIANT[c.report?.riskLevel] ?? "outline"}>
                      {c.report?.riskLevel}
                    </Badge>
                    {c.id !== consultation.id && (
                      <Link
                        href={`/doctor/reports/${c.id}`}
                        className="text-xs text-emerald-400 hover:text-emerald-300 underline"
                      >
                        View
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
}
