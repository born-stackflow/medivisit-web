"use client";

import { useId, useState } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Siren } from "lucide-react";

const ORDER = ["LOW", "MEDIUM", "HIGH", "EMERGENCY"];

const LABEL = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  EMERGENCY: "Emergency",
};

// Fixed status palette — reserved for state, never reused as a generic
// categorical hue. Values are identical in light/dark (validated against
// both chart surfaces), so no dark-mode variant is needed here.
const STATUS = {
  LOW: { color: "#0ca30c", Icon: CheckCircle2 },
  MEDIUM: { color: "#fab219", Icon: AlertCircle },
  HIGH: { color: "#ec835a", Icon: AlertTriangle },
  EMERGENCY: { color: "#d03b3b", Icon: Siren },
};

/**
 * counts: { LOW: n, MEDIUM: n, HIGH: n, EMERGENCY: n }
 * An interactive, part-to-whole stacked bar for risk-level distribution:
 * per-segment hover/focus tooltip, status-color coding with mandatory
 * icon+label pairing (status color is never the sole carrier of meaning),
 * and every value also directly readable in the legend below (the hover
 * layer enhances, it never gates).
 */
export function RiskDistributionBar({ counts }) {
  const [active, setActive] = useState(null);
  const groupId = useId();
  const total = ORDER.reduce((sum, level) => sum + (counts[level] || 0), 0);

  if (total === 0) {
    return <p className="text-sm text-muted-foreground">No triaged reports yet.</p>;
  }

  const segments = ORDER.filter((level) => counts[level] > 0);
  let cursor = 0;

  return (
    <div className="space-y-3">
      <div className="relative">
        {active && (
          <div
            role="tooltip"
            id={`${groupId}-tooltip`}
            className="absolute -top-11 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-background px-2.5 py-1.5 text-xs shadow-lg"
            style={{ left: `${active.center}%` }}
          >
            <span className="font-semibold text-white">
              {active.count} ({active.pct}%)
            </span>{" "}
            <span className="text-muted-foreground">{LABEL[active.level]}</span>
          </div>
        )}

        <div className="flex h-3.5 w-full gap-[2px] overflow-hidden rounded-full bg-muted/30">
          {segments.map((level) => {
            const count = counts[level] || 0;
            const pct = Math.round((count / total) * 100);
            const widthPct = (count / total) * 100;
            const center = cursor + widthPct / 2;
            cursor += widthPct;
            const isActive = active?.level === level;

            return (
              <button
                key={level}
                type="button"
                aria-describedby={isActive ? `${groupId}-tooltip` : undefined}
                aria-label={`${LABEL[level]}: ${count} of ${total} (${pct}%)`}
                className="h-full min-w-[3px] cursor-default transition-[filter] duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: STATUS[level].color,
                  filter: isActive ? "brightness(1.18)" : "none",
                }}
                onMouseEnter={() => setActive({ level, count, pct, center })}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive({ level, count, pct, center })}
                onBlur={() => setActive(null)}
              />
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
        {ORDER.map((level) => {
          const count = counts[level] || 0;
          const pct = total ? Math.round((count / total) * 100) : 0;
          const { color, Icon } = STATUS[level];
          return (
            <span key={level} className="flex items-center gap-1.5 text-muted-foreground">
              <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
              <span className="text-white">{LABEL[level]}</span>
              <span>
                {count} ({pct}%)
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
