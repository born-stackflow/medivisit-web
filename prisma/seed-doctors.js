/**
 * Seeds demo doctor accounts across every specialty so the "Browse Doctors"
 * list looks populated without manually signing each one up through Clerk.
 *
 * IMPORTANT: these are DISPLAY-ONLY records. Each gets a fake, unique
 * clerkUserId (e.g. "seed_doctor_1") since Prisma requires one, but no real
 * Clerk account exists behind it — nobody can actually log in as these
 * doctors. Patients CAN browse them and book appointments (a real
 * Appointment row gets created), but there's no way to log in and see it
 * from the doctor side, and video calls won't work for these. If you need
 * a doctor account you can actually log in as, sign up normally and
 * approve it via /admin as usual.
 *
 * Run with: node prisma/seed-doctors.js
 */

const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

const DOCTORS = [
  {
    name: "Dr. Sarah Mitchell",
    specialty: "General Medicine",
    experience: 14,
    description:
      "General practitioner focused on preventive care, chronic disease management, and whole-family medicine. Sarah has spent over a decade helping patients navigate everyday health concerns before they become serious.",
  },
  {
    name: "Dr. James Okafor",
    specialty: "Cardiology",
    experience: 18,
    description:
      "Consultant cardiologist specialising in hypertension, arrhythmia management, and post-cardiac-event recovery planning. James takes a data-driven approach to long-term heart health.",
  },
  {
    name: "Dr. Priya Nair",
    specialty: "Dermatology",
    experience: 9,
    description:
      "Dermatologist with a focus on acne, eczema, and early skin cancer screening. Priya believes in clear, jargon-free explanations so patients understand exactly what's happening with their skin.",
  },
  {
    name: "Dr. Michael Chen",
    specialty: "Endocrinology",
    experience: 11,
    description:
      "Endocrinologist specialising in diabetes management, thyroid disorders, and metabolic health. Michael works closely with patients on sustainable, practical treatment plans.",
  },
  {
    name: "Dr. Amara Osei",
    specialty: "Gastroenterology",
    experience: 15,
    description:
      "Gastroenterologist with expertise in IBS, reflux disease, and digestive health more broadly. Amara combines evidence-based medicine with attentive, unhurried consultations.",
  },
  {
    name: "Dr. Daniel Kowalski",
    specialty: "Neurology",
    experience: 20,
    description:
      "Neurologist with two decades of experience treating migraines, epilepsy, and neurodegenerative conditions. Daniel is known for taking the time to explain complex diagnoses clearly.",
  },
  {
    name: "Dr. Fatima Al-Sayed",
    specialty: "Obstetrics & Gynecology",
    experience: 13,
    description:
      "OB-GYN supporting patients through every stage of reproductive health, from routine care to pregnancy and beyond. Fatima's approach centres patient comfort and informed choice.",
  },
  {
    name: "Dr. Robert Hale",
    specialty: "Oncology",
    experience: 22,
    description:
      "Medical oncologist with a special interest in early detection and personalised treatment planning. Robert works alongside patients and their families throughout the entire care journey.",
  },
  {
    name: "Dr. Lucy Bennett",
    specialty: "Ophthalmology",
    experience: 10,
    description:
      "Ophthalmologist covering routine eye care, glaucoma monitoring, and pre/post-surgical consultations. Lucy is passionate about early intervention to protect long-term vision.",
  },
  {
    name: "Dr. Andres Vega",
    specialty: "Orthopedics",
    experience: 16,
    description:
      "Orthopaedic specialist focused on sports injuries, joint pain, and post-fracture rehabilitation. Andres tailors recovery plans to each patient's lifestyle and goals.",
  },
  {
    name: "Dr. Hannah Wright",
    specialty: "Pediatrics",
    experience: 12,
    description:
      "Paediatrician providing care from infancy through adolescence, including developmental checks and vaccination guidance. Hannah is known for putting anxious young patients at ease.",
  },
  {
    name: "Dr. Omar Farouk",
    specialty: "Psychiatry",
    experience: 17,
    description:
      "Psychiatrist specialising in anxiety, depression, and stress-related conditions. Omar takes a collaborative approach, combining therapy referrals with careful medication management where needed.",
  },
  {
    name: "Dr. Grace Lindqvist",
    specialty: "Pulmonology",
    experience: 14,
    description:
      "Pulmonologist treating asthma, COPD, and other respiratory conditions. Grace focuses on practical, day-to-day symptom management alongside long-term lung health.",
  },
  {
    name: "Dr. Kenji Watanabe",
    specialty: "Radiology",
    experience: 19,
    description:
      "Diagnostic radiologist with extensive experience interpreting imaging across all major body systems, supporting accurate and timely diagnoses for referring clinicians and patients alike.",
  },
  {
    name: "Dr. Elena Petrova",
    specialty: "Urology",
    experience: 15,
    description:
      "Urologist covering kidney stones, UTIs, and broader urinary tract health for adult patients. Elena prioritises clear communication around sensitive health topics.",
  },
];

async function main() {
  console.log(`Seeding ${DOCTORS.length} demo doctors...`);

  for (const [i, doc] of DOCTORS.entries()) {
    const n = i + 1;
    const email = `seed.doctor.${n}@medivisit.demo`;
    const clerkUserId = `seed_doctor_${n}`;

    const user = await db.user.upsert({
      where: { email },
      update: {
        name: doc.name,
        specialty: doc.specialty,
        experience: doc.experience,
        description: doc.description,
        verificationStatus: "VERIFIED",
      },
      create: {
        clerkUserId,
        email,
        name: doc.name,
        role: "DOCTOR",
        specialty: doc.specialty,
        experience: doc.experience,
        credentialUrl: "https://example.com/demo-credentials.pdf",
        description: doc.description,
        verificationStatus: "VERIFIED",
      },
    });

    const hasAvailability = await db.availability.findFirst({
      where: { doctorId: user.id },
    });

    if (!hasAvailability) {
      const start = new Date();
      start.setHours(9, 0, 0, 0);
      const end = new Date();
      end.setHours(17, 0, 0, 0);

      await db.availability.create({
        data: { doctorId: user.id, startTime: start, endTime: end, status: "AVAILABLE" },
      });
    }

    console.log(`  ✓ ${doc.name} (${doc.specialty})`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
