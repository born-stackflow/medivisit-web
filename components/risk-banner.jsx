const STYLES = {
  EMERGENCY: "bg-red-600 text-white border-red-600",
  HIGH: "bg-orange-950/40 text-orange-300 border-orange-800",
  MEDIUM: "bg-yellow-950/30 text-yellow-300 border-yellow-800",
  LOW: "bg-emerald-950/30 text-emerald-300 border-emerald-800",
};

const MESSAGES = {
  EMERGENCY:
    "This may be a medical emergency. Call 999 now, or go to your nearest A&E. Do not wait for this consultation.",
  HIGH: "Your symptoms suggest you should be seen urgently — please contact your GP or NHS 111 promptly.",
  MEDIUM: "Your symptoms suggest a routine GP appointment is appropriate.",
  LOW: "Your symptoms sound manageable at home, but a doctor will confirm after reviewing your summary.",
};

export function RiskBanner({ riskLevel }) {
  if (!riskLevel) return null;
  const level = riskLevel.toUpperCase();

  return (
    <div
      role="alert"
      className={`rounded-lg border px-4 py-3 text-sm font-medium ${STYLES[level]}`}
    >
      {MESSAGES[level]}
    </div>
  );
}
