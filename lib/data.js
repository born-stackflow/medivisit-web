import {
  Calendar,
  Video,
  MessageCircleHeart,
  Pill,
  FileText,
  ShieldCheck,
} from "lucide-react";

// JSON data for features
export const features = [
  {
    icon: <MessageCircleHeart className="h-6 w-6 text-emerald-400" />,
    title: "AI Symptom Checker",
    description:
      "Describe your symptoms to our AI Doctor before you ever book — it asks the right follow-up questions and prepares a summary for a real doctor to review.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
    title: "Independent Safety Net",
    description:
      "A second, separate system scans every message for red-flag symptoms and can flag a possible emergency immediately — regardless of what the AI decides to say.",
  },
  {
    icon: <Calendar className="h-6 w-6 text-emerald-400" />,
    title: "Book Real Appointments",
    description:
      "Browse verified doctor profiles by specialty, check availability, and book appointments that fit your schedule.",
  },
  {
    icon: <Video className="h-6 w-6 text-emerald-400" />,
    title: "Video Consultation",
    description:
      "Connect with doctors through secure, high-quality video consultations from the comfort of your home.",
  },
  {
    icon: <Pill className="h-6 w-6 text-emerald-400" />,
    title: "Prescriptions & Diet Plans",
    description:
      "Doctors review your AI-triaged report and can issue a prescription and personalised dietary guidance directly to your account.",
  },
  {
    icon: <FileText className="h-6 w-6 text-emerald-400" />,
    title: "Your Full Health Record",
    description:
      "Every AI report, appointment, prescription, and diet plan lives in one place you can look back on anytime.",
  },
];

// JSON data for testimonials
export const testimonials = [
  {
    initials: "SP",
    name: "Sarah P.",
    role: "Patient",
    quote:
      "The video consultation feature saved me so much time. I was able to get medical advice without taking time off work or traveling to a clinic.",
  },
  {
    initials: "DR",
    name: "Dr. Robert M.",
    role: "Cardiologist",
    quote:
      "This platform has revolutionized my practice. I can now reach more patients and provide timely care without the constraints of a physical office.",
  },
  {
    initials: "JT",
    name: "James T.",
    role: "Patient",
    quote:
      "The credit system is so convenient. I purchased a package for my family, and we've been able to consult with specialists whenever needed.",
  },
];

// JSON data for credit system benefits
export const creditBenefits = [
  "Each consultation requires <strong class='text-emerald-400'>2 credits</strong> regardless of duration",
  "Credits <strong class='text-emerald-400'>never expire</strong> - use them whenever you need",
  "Monthly subscriptions give you <strong class='text-emerald-400'>fresh credits every month</strong>",
  "Cancel or change your subscription <strong class='text-emerald-400'>anytime</strong> without penalties",
];
