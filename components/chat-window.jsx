"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { MessageBubble } from "@/components/message-bubble";
import { RiskBanner } from "@/components/risk-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendConsultMessage } from "@/actions/consult";

const WELCOME = {
  sender: "AI",
  content:
    "Hi, I'm the Medi-Visit AI Doctor. I'll ask a few questions to prepare a summary for a doctor to review. What's the main thing that's been bothering you?",
};

export function ChatWindow({ consultationId, initialMessages, initialReportReady }) {
  const [messages, setMessages] = useState(
    initialMessages.length > 0 ? initialMessages : [WELCOME]
  );
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [riskLevel, setRiskLevel] = useState(null);
  const [reportReady, setReportReady] = useState(initialReportReady);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text || pending || reportReady) return;

    setMessages((prev) => [...prev, { sender: "PATIENT", content: text }]);
    setInput("");
    setPending(true);
    setError(null);

    try {
      const result = await sendConsultMessage(consultationId, text);
      setMessages((prev) => [...prev, { sender: "AI", content: result.reply }]);
      if (result.riskLevel) setRiskLevel(result.riskLevel);
      if (result.reportReady) setReportReady(true);
    } catch (err) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setPending(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {riskLevel && <RiskBanner riskLevel={riskLevel} />}

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-lg border p-4 min-h-[50vh] max-h-[65vh]">
        {messages.map((m, i) => (
          <MessageBubble key={i} sender={m.sender} content={m.content} />
        ))}
        {pending && <MessageBubble sender="AI" content="Thinking..." />}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {reportReady ? (
        <div className="flex flex-col gap-3 rounded-lg border border-emerald-800 bg-emerald-950/30 p-4 text-sm text-emerald-300">
          <p>
            Thanks — your summary has been prepared and sent to a doctor for
            review.
          </p>
          <Link href="/appointments" className="underline">
            Book a doctor consultation
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={pending}
            placeholder="Type your message..."
          />
          <Button type="submit" disabled={pending || !input.trim()}>
            Send
          </Button>
        </form>
      )}
    </div>
  );
}
