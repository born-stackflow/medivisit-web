import Link from "next/link";
import { Pill, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PrescriptionView({ prescription }) {
  const report = prescription.consultation?.report;

  return (
    <Card className="border-emerald-900/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Pill className="h-5 w-5 mr-2 text-emerald-400" />
            Prescription
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            Dr. {prescription.doctor?.name} — {new Date(prescription.createdAt).toLocaleDateString()}
          </span>
        </CardTitle>
        {report && (
          <div className="flex items-center justify-between flex-wrap gap-2 rounded-md bg-emerald-950/30 border border-emerald-800 px-3 py-2 text-xs">
            <span className="text-emerald-300">
              For your <strong>{report.predictedCategory.replace(/_/g, " ")}</strong> report from{" "}
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
            <Link
              href={`/doctor/reports/${prescription.consultationId}`}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 underline shrink-0"
            >
              <FileText className="h-3 w-3" />
              View full report
            </Link>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {prescription.diagnosis && (
          <div>
            <p className="text-muted-foreground mb-1">Diagnosis</p>
            <p>{prescription.diagnosis}</p>
          </div>
        )}

        <div className="space-y-2">
          {prescription.items.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <p className="font-medium text-white">
                {item.medicationName} — {item.dosage}
              </p>
              <p className="text-muted-foreground">
                {item.frequency} for {item.duration}
              </p>
              {item.instructions && (
                <p className="text-muted-foreground italic mt-1">{item.instructions}</p>
              )}
            </div>
          ))}
        </div>

        {prescription.notes && (
          <div>
            <p className="text-muted-foreground mb-1">Notes</p>
            <p>{prescription.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
