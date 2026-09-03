"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPrescription } from "@/actions/prescriptions";

const EMPTY_ITEM = { medicationName: "", dosage: "", frequency: "", duration: "", instructions: "" };

export function PrescriptionForm({ consultationId }) {
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function updateItem(index, field, value) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await createPrescription({ consultationId, diagnosis, notes, items });
        router.refresh();
      } catch (err) {
        setError(err.message ?? "Failed to save prescription");
      }
    });
  }

  return (
    <Card className="border-emerald-900/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Pill className="h-5 w-5 mr-2 text-emerald-400" />
          Write Prescription
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="diagnosis">Diagnosis (optional)</Label>
            <Input
              id="diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute pharyngitis"
            />
          </div>

          <div className="space-y-3">
            <Label>Medications</Label>
            {items.map((item, i) => (
              <div key={i} className="rounded-lg border p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Medication name"
                    value={item.medicationName}
                    onChange={(e) => updateItem(i, "medicationName", e.target.value)}
                  />
                  <Input
                    placeholder="Dosage (e.g. 500mg)"
                    value={item.dosage}
                    onChange={(e) => updateItem(i, "dosage", e.target.value)}
                  />
                  <Input
                    placeholder="Frequency (e.g. twice daily)"
                    value={item.frequency}
                    onChange={(e) => updateItem(i, "frequency", e.target.value)}
                  />
                  <Input
                    placeholder="Duration (e.g. 7 days)"
                    value={item.duration}
                    onChange={(e) => updateItem(i, "duration", e.target.value)}
                  />
                </div>
                <Input
                  placeholder="Instructions (optional, e.g. take after food)"
                  value={item.instructions}
                  onChange={(e) => updateItem(i, "instructions", e.target.value)}
                />
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(i)}
                    className="text-red-400 hover:text-red-300 h-8 px-2"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add another medication
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes for patient (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional guidance..."
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Saving..." : "Save Prescription"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
