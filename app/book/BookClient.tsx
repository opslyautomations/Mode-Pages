"use client";

import { useEffect, useState } from "react";
import { CalendlyEmbed } from "@/components/CalendlyEmbed";
import { loadResult, type StoredResult } from "@/lib/result-store";

export function BookClient({ leadId, tier }: { leadId: string; tier: string }) {
  const [stored, setStored] = useState<StoredResult | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setStored(loadResult(leadId));
    setReady(true);
  }, [leadId]);
  if (!ready) return <div className="skeleton h-[700px] rounded-card" aria-hidden="true" />;
  return <CalendlyEmbed leadId={leadId} tier={tier} stored={stored} />;
}
