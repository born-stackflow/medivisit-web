"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, UserSearch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { findPatientByIdOrEmail } from "@/actions/patient-history";

export function PatientLookup() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const patient = await findPatientByIdOrEmail(query);
        router.push(`/doctor/patients/${patient.id}`);
      } catch (err) {
        setError(err.message ?? "Patient not found");
      }
    });
  }

  return (
    <Card className="border-emerald-900/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserSearch className="h-5 w-5 mr-2 text-emerald-400" />
          Patient Lookup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Look up a patient by their ID or email to see their full history — AI
          reports, appointments, prescriptions, and diet plans, across any doctor
          they've seen.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Patient ID or email"
          />
          <Button type="submit" disabled={pending}>
            <Search className="h-4 w-4 mr-1.5" />
            {pending ? "Searching..." : "Search"}
          </Button>
        </form>
        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
}
