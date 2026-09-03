"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, CheckCircle2, UserSearch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const RISK_VARIANT = {
  EMERGENCY: "destructive",
  HIGH: "destructive",
  MEDIUM: "secondary",
  LOW: "outline",
};

function ReportRow({ c }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4 hover:border-emerald-700/50 transition-colors">
      <Link href={`/doctor/reports/${c.id}`} className="flex-1">
        <p className="font-medium text-white">{c.patient?.name ?? c.patient?.email}</p>
        <p className="text-sm text-muted-foreground">
          {c.report?.predictedCategory} — {new Date(c.createdAt).toLocaleString()}
        </p>
      </Link>
      <div className="flex items-center gap-2">
        {c.report && (
          <Badge variant={RISK_VARIANT[c.report.riskLevel] ?? "outline"}>
            {c.report.riskLevel}
          </Badge>
        )}
        <Link
          href={`/doctor/patients/${c.patientId}`}
          title="View full patient history"
          className="text-muted-foreground hover:text-emerald-400 p-1.5"
        >
          <UserSearch className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function AiReportsList({ pending, reviewed }) {
  const [view, setView] = useState("pending");
  const consultations = view === "pending" ? pending : reviewed;

  return (
    <Card className="border-emerald-900/20">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
        <CardTitle className="text-xl font-bold text-white flex items-center">
          <ClipboardList className="h-5 w-5 mr-2 text-emerald-400" />
          AI Reports
        </CardTitle>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={view === "pending" ? "default" : "outline"}
            onClick={() => setView("pending")}
          >
            Awaiting Review ({pending.length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === "reviewed" ? "default" : "outline"}
            onClick={() => setView("reviewed")}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Reviewed ({reviewed.length})
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {consultations.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-xl font-medium text-white mb-2">
              {view === "pending" ? "Nothing to review" : "No reviewed reports yet"}
            </h3>
            <p className="text-muted-foreground">
              {view === "pending"
                ? "AI-triaged patient reports will show up here once a patient completes the symptom checker."
                : "Reports you've marked as reviewed will show up here — handy if you need to go back and add a prescription or diet plan you missed."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {consultations.map((c) => (
              <ReportRow key={c.id} c={c} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
