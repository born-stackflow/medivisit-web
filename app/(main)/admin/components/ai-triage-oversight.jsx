import Link from "next/link";
import { ClipboardList, Activity, AlertTriangle, Gauge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskDistributionBar } from "@/components/risk-distribution-bar";

const RISK_VARIANT = {
  EMERGENCY: "destructive",
  HIGH: "destructive",
  MEDIUM: "secondary",
  LOW: "outline",
};

export function AiTriageOversight({ consultations, stats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-background border-emerald-900/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Activity className="h-8 w-8 text-emerald-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total AI consultations</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background border-emerald-900/20">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.byRiskLevel.EMERGENCY || 0}</p>
              <p className="text-xs text-muted-foreground">Flagged emergency</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background border-emerald-900/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Gauge className="h-8 w-8 text-emerald-400" />
            <div>
              <p className="text-2xl font-bold text-white">
                {Math.round(stats.avgConfidence * 100)}%
              </p>
              <p className="text-xs text-muted-foreground">Avg. classifier confidence</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/20 border-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white">Risk-Level Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <RiskDistributionBar counts={stats.byRiskLevel} />
        </CardContent>
      </Card>

      <Card className="bg-muted/20 border-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center">
            <ClipboardList className="h-5 w-5 mr-2 text-emerald-400" />
            All AI Consultations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {consultations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No AI-triaged consultations yet.
            </div>
          ) : (
            <div className="space-y-3">
              {consultations.map((c) => (
                <Link key={c.id} href={`/doctor/reports/${c.id}`}>
                  <div className="flex items-center justify-between rounded-lg border bg-background p-4 hover:border-emerald-700/50 transition-colors">
                    <div>
                      <p className="font-medium text-white">
                        {c.patient?.name ?? c.patient?.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {c.report?.predictedCategory} — {new Date(c.createdAt).toLocaleString()}
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
    </div>
  );
}
