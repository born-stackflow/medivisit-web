const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

/**
 * Calls the FastAPI ai-service's /consult endpoint (Gemini triage chat +
 * safety.py red-flag scan + classifier.py). Stateless — it doesn't know
 * about Prisma/Clerk, just conversation history in, structured turn out.
 */
export async function runConsultTurn({ consultationId, message, history }) {
  const response = await fetch(`${AI_SERVICE_URL}/consult`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      consultation_id: consultationId,
      message,
      history,
    }),
  });

  if (!response.ok) {
    throw new Error(`ai-service error: ${response.status}`);
  }

  return response.json();
}

/**
 * Calls /diet-draft — a one-shot Gemini-generated draft of dietary
 * guidance. Always a draft: the caller (actions/diet.js) never persists
 * this directly, only returns it to a doctor's form for review/editing.
 */
export async function generateDietDraft({ summary, diagnosis }) {
  const response = await fetch(`${AI_SERVICE_URL}/diet-draft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ summary, diagnosis }),
  });

  if (!response.ok) {
    throw new Error(`ai-service error: ${response.status}`);
  }

  return response.json();
}
