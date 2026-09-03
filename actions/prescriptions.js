"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Doctor writes a prescription tied to a consultation they're reviewing.
 * items: [{ medicationName, dosage, frequency, duration, instructions? }]
 * One prescription per consultation — createPrescription is only ever
 * called from a form that's hidden once a prescription already exists.
 */
export async function createPrescription({ consultationId, diagnosis, notes, items }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const doctor = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!doctor || doctor.role !== "DOCTOR") throw new Error("Doctors only");

  if (!items || items.length === 0) {
    throw new Error("At least one medication is required");
  }
  for (const item of items) {
    if (!item.medicationName?.trim() || !item.dosage?.trim() || !item.frequency?.trim() || !item.duration?.trim()) {
      throw new Error("Each medication needs a name, dosage, frequency, and duration");
    }
  }

  const consultation = await db.consultation.findUnique({ where: { id: consultationId } });
  if (!consultation) throw new Error("Consultation not found");

  const prescription = await db.prescription.create({
    data: {
      doctorId: doctor.id,
      patientId: consultation.patientId,
      consultationId,
      diagnosis: diagnosis?.trim() || null,
      notes: notes?.trim() || null,
      items: {
        create: items.map((item) => ({
          medicationName: item.medicationName.trim(),
          dosage: item.dosage.trim(),
          frequency: item.frequency.trim(),
          duration: item.duration.trim(),
          instructions: item.instructions?.trim() || null,
        })),
      },
    },
    include: { items: true },
  });

  revalidatePath(`/doctor/reports/${consultationId}`);
  revalidatePath("/my-reports");

  return prescription;
}

export async function getPrescriptionForConsultation(consultationId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.prescription.findUnique({
    where: { consultationId },
    include: { items: true, doctor: { select: { name: true } } },
  });
}

export async function listMyPrescriptions() {
  const { userId } = await auth();
  if (!userId) return [];

  const patient = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!patient) return [];

  return db.prescription.findMany({
    where: { patientId: patient.id },
    include: {
      items: true,
      doctor: { select: { name: true } },
      consultation: { include: { report: { select: { predictedCategory: true, createdAt: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}
