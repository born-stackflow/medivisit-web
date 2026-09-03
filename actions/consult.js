"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { runConsultTurn } from "@/lib/aiService";

const SENDER_TO_AI = { PATIENT: "patient", AI: "ai" };
const RISK_FROM_AI = { low: "LOW", medium: "MEDIUM", high: "HIGH", emergency: "EMERGENCY" };

/**
 * Finds the current patient's in-progress AI consultation, or starts a new
 * one. Mirrors the "find or create" pattern actions/appointments.js uses
 * for the doctor-booking flow, just for the AI triage chat instead.
 */
export async function getOrCreateConsultation() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const patient = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!patient || patient.role !== "PATIENT") {
    throw new Error("Only patients can start an AI consultation");
  }

  let consultation = await db.consultation.findFirst({
    where: { patientId: patient.id, status: "IN_PROGRESS" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!consultation) {
    consultation = await db.consultation.create({
      data: { patientId: patient.id },
      include: { messages: true },
    });
  }

  return consultation;
}

/**
 * Sends the patient's message to ai-service, stores both sides of the
 * turn, and — once the LLM signals it has enough information — writes the
 * structured SymptomReport and flips the consultation to AWAITING_REVIEW.
 * The independent safety.py red-flag scan runs inside ai-service on every
 * turn regardless of report_ready, so risk_level can come back "emergency"
 * from turn one.
 */
export async function sendConsultMessage(consultationId, content) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!content?.trim()) throw new Error("Message cannot be empty");

  const patient = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!patient) throw new Error("User not found");

  const consultation = await db.consultation.findUnique({
    where: { id: consultationId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!consultation || consultation.patientId !== patient.id) {
    throw new Error("Consultation not found");
  }

  const history = consultation.messages.map((m) => ({
    sender: SENDER_TO_AI[m.sender],
    content: m.content,
  }));

  await db.message.create({
    data: { consultationId, sender: "PATIENT", content },
  });

  let aiResult;
  try {
    aiResult = await runConsultTurn({ consultationId, message: content, history });
  } catch (error) {
    console.error("ai-service call failed:", error);
    throw new Error("The AI consultation service is unavailable right now.");
  }

  await db.message.create({
    data: { consultationId, sender: "AI", content: aiResult.reply },
  });

  let report = null;
  if (aiResult.report_ready && aiResult.report) {
    const r = aiResult.report;
    report = await db.symptomReport.create({
      data: {
        consultationId,
        summary: r.summary,
        extractedSymptoms: r.extracted_symptoms,
        predictedCategory: r.predicted_category,
        confidence: r.confidence,
        riskLevel: RISK_FROM_AI[r.risk_level] ?? "MEDIUM",
        recommendedAction: r.recommended_action,
      },
    });

    await db.consultation.update({
      where: { id: consultationId },
      data: { status: "AWAITING_REVIEW" },
    });
  }

  revalidatePath("/ai-consult");
  revalidatePath("/doctor");

  return {
    reply: aiResult.reply,
    riskLevel: aiResult.risk_level,
    reportReady: aiResult.report_ready,
    report,
  };
}

export async function listMyConsultations() {
  const { userId } = await auth();
  if (!userId) return [];

  const patient = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!patient) return [];

  return db.consultation.findMany({
    where: { patientId: patient.id },
    include: { report: true },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * For the doctor-facing review list — every consultation whose AI report
 * is ready but hasn't been marked reviewed yet. Any verified doctor can
 * see any patient's report here (this triage layer isn't tied to a
 * specific booked appointment/doctor, same as the original vertical slice).
 */
export async function listReportsForReview() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user || user.role !== "DOCTOR") throw new Error("Doctors only");

  return db.consultation.findMany({
    where: { status: "AWAITING_REVIEW" },
    include: { report: true, patient: { select: { name: true, email: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

/**
 * Reports a doctor has already marked reviewed — kept separate from
 * listReportsForReview so the main queue only ever shows what still needs
 * action, while this gives a way back to something already actioned (e.g.
 * to add a diet plan/prescription that was missed the first time).
 */
export async function listReviewedReports() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user || user.role !== "DOCTOR") throw new Error("Doctors only");

  return db.consultation.findMany({
    where: { status: "REVIEWED" },
    include: { report: true, patient: { select: { name: true, email: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getConsultationDetail(consultationId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const consultation = await db.consultation.findUnique({
    where: { id: consultationId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      report: true,
      patient: { select: { name: true, email: true } },
    },
  });

  if (!consultation) throw new Error("Consultation not found");

  const isOwner = consultation.patientId === user.id;
  const canReview = user.role === "DOCTOR" || user.role === "ADMIN";
  if (!isOwner && !canReview) throw new Error("Not authorized to view this consultation");

  return consultation;
}

/**
 * A given patient's full AI-triage history, oldest first — used to show a
 * doctor/admin the patient's risk pattern over time when reviewing a report,
 * not just the single consultation they clicked into.
 */
export async function getPatientHistory(patientId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
    throw new Error("Not authorized");
  }

  return db.consultation.findMany({
    where: { patientId, report: { isNot: null } },
    include: { report: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function markReportReviewed(consultationId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user || user.role !== "DOCTOR") throw new Error("Doctors only");

  await db.consultation.update({
    where: { id: consultationId },
    data: { status: "REVIEWED" },
  });

  revalidatePath("/doctor");
  return { success: true };
}
