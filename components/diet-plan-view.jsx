import Link from "next/link";
import { Utensils, Sparkles, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DietPlanView({ dietPlan, showAiBadge = false }) {
  const report = dietPlan.consultation?.report;

  return (
    <Card className="border-emerald-900/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Utensils className="h-5 w-5 mr-2 text-emerald-400" />
            Diet Recommendations
          </span>
          <span className="text-xs font-normal text-muted-foreground flex items-center gap-2">
            {showAiBadge && dietPlan.aiGenerated && (
              <span className="flex items-center gap-1 text-emerald-400">
                <Sparkles className="h-3 w-3" />
                AI-assisted
              </span>
            )}
            Dr. {dietPlan.doctor?.name} — {new Date(dietPlan.createdAt).toLocaleDateString()}
          </span>
        </CardTitle>
        {report && (
          <div className="flex items-center justify-between flex-wrap gap-2 rounded-md bg-emerald-950/30 border border-emerald-800 px-3 py-2 text-xs">
            <span className="text-emerald-300">
              For your <strong>{report.predictedCategory.replace(/_/g, " ")}</strong> report from{" "}
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
            <Link
              href={`/doctor/reports/${dietPlan.consultationId}`}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 underline shrink-0"
            >
              <FileText className="h-3 w-3" />
              View full report
            </Link>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {dietPlan.foodsToInclude && (
          <div>
            <p className="text-muted-foreground mb-1">Foods to include</p>
            <p>{dietPlan.foodsToInclude}</p>
          </div>
        )}
        {dietPlan.foodsToAvoid && (
          <div>
            <p className="text-muted-foreground mb-1">Foods to avoid</p>
            <p>{dietPlan.foodsToAvoid}</p>
          </div>
        )}
        {dietPlan.guidance && (
          <div>
            <p className="text-muted-foreground mb-1">Guidance</p>
            <p>{dietPlan.guidance}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
