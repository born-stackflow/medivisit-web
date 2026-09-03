"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { markReportReviewed } from "@/actions/consult";

export function ReviewButton({ consultationId }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      await markReportReviewed(consultationId);
      router.refresh();
    });
  }

  return (
    <Button onClick={handleClick} disabled={pending} className="w-full">
      {pending ? "Marking..." : "Mark as reviewed"}
    </Button>
  );
}
