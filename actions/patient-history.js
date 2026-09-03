"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

async function requireReviewer() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) {
    throw new Error("Doctors and admins only");
  }
  return user;
}

/**
 * Everything a doctor/admin can pull up about one patient by their ID —
 * the "patient chart" view. Deliberately shows history across ALL doctors,
 * not just the viewer's own interactions with this patient, matching how
 * the AI-triage queue already works (any doctor can review any patient).
 */
export async function getPatientBasicInfo(patientId) {
  await requireReviewer();

  const patient = await db.user.findUnique({
    where: { id: patientId, role: "PATIENT" },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  if (!patient) throw new Error("Patient not found");
  return patient;
}

export async function getPatientAppointmentHistory(patientId) {
  await requireReviewer();

  return db.appointment.findMany({
    where: { patientId },
    include: { doctor: { select: { id: true, name: true, specialty: true, imageUrl: true } } },
    orderBy: { startTime: "desc" },
  });
}

export async function getPatientPrescriptionHistory(patientId) {
  await requireReviewer();

  return db.prescription.findMany({
    where: { patientId },
    include: {
      items: true,
      doctor: { select: { name: true } },
      consultation: { include: { report: { select: { predictedCategory: true, createdAt: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Looks up a patient by exact ID or email so a doctor can jump straight to
 * their history page without needing to find them via the AI Reports/
 * Appointments lists first. IDs are UUIDs (not human-friendly), so email
 * is the more practical lookup in practice — both are supported.
 */
export async function findPatientByIdOrEmail(query) {
  await requireReviewer();

  const trimmed = query?.trim();
  if (!trimmed) throw new Error("Enter a patient ID or email");

  const patient = await db.user.findFirst({
    where: {
      role: "PATIENT",
      OR: [{ id: trimmed }, { email: trimmed }],
    },
    select: { id: true, name: true, email: true },
  });

  if (!patient) throw new Error("No patient found with that ID or email");
  return patient;
}

export async function getPatientDietPlanHistory(patientId) {
  await requireReviewer();

  return db.dietPlan.findMany({
    where: { patientId },
    include: {
      doctor: { select: { name: true } },
      consultation: { include: { report: { select: { predictedCategory: true, createdAt: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}
