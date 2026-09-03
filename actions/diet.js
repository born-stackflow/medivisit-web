"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateDietDraft } from "@/lib/aiService";

/**
 * Doctor-only: asks Gemini for a draft diet plan based on the consultation's
 * report + any existing prescription diagnosis. Returns the draft directly
 * to the caller — nothing is saved here, so it's never visible to the
 * patient unless the doctor reviews it in the form and explicitly saves.
 */
export async function draftDietPlan(consultationId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const doctor = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!doctor || doctor.role !== "DOCTOR") throw new Error("Doctors only");

  const consultation = await db.consultation.findUnique({
    where: { id: consultationId },
    include: { report: true, prescription: true },
  });
  if (!consultation) throw new Error("Consultation not found");

  const summary = consultation.report?.summary;
  if (!summary) throw new Error("No report to draft from yet");

  const draft = await generateDietDraft({
    summary,
    diagnosis: consultation.prescription?.diagnosis ?? "",
  });

  return {
    foodsToInclude: draft.foods_to_include ?? [],
    foodsToAvoid: draft.foods_to_avoid ?? [],
    guidance: draft.guidance ?? "",
  };
}

export async function saveDietPlan({ consultationId, foodsToInclude, foodsToAvoid, guidance, aiGenerated }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const doctor = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!doctor || doctor.role !== "DOCTOR") throw new Error("Doctors only");

  const consultation = await db.consultation.findUnique({ where: { id: consultationId } });
  if (!consultation) throw new Error("Consultation not found");

  const dietPlan = await db.dietPlan.create({
    data: {
      doctorId: doctor.id,
      patientId: consultation.patientId,
      consultationId,
      foodsToInclude: (foodsToInclude || []).join(", ") || null,
      foodsToAvoid: (foodsToAvoid || []).join(", ") || null,
      guidance: guidance?.trim() || null,
      aiGenerated: !!aiGenerated,
    },
  });

  revalidatePath(`/doctor/reports/${consultationId}`);
  revalidatePath("/my-reports");

  return dietPlan;
}

export async function getDietPlanForConsultation(consultationId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.dietPlan.findUnique({
    where: { consultationId },
    include: { doctor: { select: { name: true } } },
  });
}

export async function listMyDietPlans() {
  const { userId } = await auth();
  if (!userId) return [];

  const patient = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!patient) return [];

  return db.dietPlan.findMany({
    where: { patientId: patient.id },
    include: {
      doctor: { select: { name: true } },
      consultation: { include: { report: { select: { predictedCategory: true, createdAt: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}
