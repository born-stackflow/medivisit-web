export function MessageBubble({ sender, content }) {
  const isPatient = sender === "PATIENT" || sender === "patient";

  return (
    <div className={`flex ${isPatient ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap ${
          isPatient
            ? "bg-emerald-600 text-white"
            : "bg-muted/50 border text-foreground"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
