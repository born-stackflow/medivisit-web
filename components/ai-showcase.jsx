"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageCircleHeart, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageBubble } from "@/components/message-bubble";
import { RiskBanner } from "@/components/risk-banner";

const SCENARIOS = {
  everyday: {
    label: "Everyday symptom",
    risk: null,
    messages: [
      {
        sender: "AI",
        content:
          "Hi, I'm the Medi-Visit AI Doctor. What's the main thing that's been bothering you?",
      },
      { sender: "PATIENT", content: "I've had a sore throat and mild fever for two days" },
      {
        sender: "AI",
        content:
          "Thanks for sharing that. Are you able to swallow liquids okay, and have you noticed a cough?",
      },
    ],
  },
  emergency: {
    label: "Possible emergency",
    risk: "EMERGENCY",
    messages: [
      {
        sender: "AI",
        content:
          "Hi, I'm the Medi-Visit AI Doctor. What's the main thing that's been bothering you?",
      },
      { sender: "PATIENT", content: "I have crushing chest pain and can't breathe properly" },
    ],
  },
};

export function AiShowcase() {
  const [active, setActive] = useState("everyday");
  const scenario = SCENARIOS[active];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge
              variant="outline"
              className="bg-emerald-900/30 border-emerald-700/30 px-4 py-2 text-emerald-400 text-sm font-medium"
            >
              <MessageCircleHeart className="h-3.5 w-3.5 mr-2 inline" />
              AI Symptom Checker
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Talk through your symptoms before you ever see a doctor
            </h2>
            <p className="text-muted-foreground text-lg">
              Our AI asks the questions a GP would ask first — duration, severity, what makes
              it worse — and never diagnoses on its own. A separate, independent safety check
              scans every message, so a possible emergency gets flagged immediately, regardless
              of what the AI decides to say.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant={active === "everyday" ? "default" : "outline"}
                className={active === "everyday" ? "bg-emerald-600 hover:bg-emerald-700" : "border-emerald-700/30"}
                onClick={() => setActive("everyday")}
              >
                Everyday symptom
              </Button>
              <Button
                type="button"
                variant={active === "emergency" ? "default" : "outline"}
                className={active === "emergency" ? "bg-red-600 hover:bg-red-700" : "border-emerald-700/30"}
                onClick={() => setActive("emergency")}
              >
                <ShieldAlert className="h-4 w-4 mr-1.5" />
                Possible emergency
              </Button>
            </div>

            <div>
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/ai-consult">
                  Try the AI Symptom Checker <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-900/20 bg-card p-4 shadow-xl space-y-3 min-h-[280px]">
            {scenario.risk && <RiskBanner riskLevel={scenario.risk} />}
            {scenario.messages.map((m, i) => (
              <MessageBubble key={`${active}-${i}`} sender={m.sender} content={m.content} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
