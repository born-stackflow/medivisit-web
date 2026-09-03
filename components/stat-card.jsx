import { Card, CardContent } from "@/components/ui/card";

const COLOR_MAP = {
  emerald: "bg-emerald-950/30 border-emerald-800 text-emerald-400",
  blue: "bg-blue-950/30 border-blue-800 text-blue-400",
  amber: "bg-amber-950/30 border-amber-800 text-amber-400",
  red: "bg-red-950/30 border-red-800 text-red-400",
};

export function StatCard({ icon, value, label, color = "emerald" }) {
  return (
    <Card className={`border ${COLOR_MAP[color] ?? COLOR_MAP.emerald}`}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="shrink-0">{icon}</div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
