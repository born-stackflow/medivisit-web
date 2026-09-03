export function DashboardHeader({ icon, title, subtitle }) {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-950 p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-white shadow-lg">
      <div className="flex items-center gap-3">
        <div className="bg-white/10 rounded-lg p-3 shrink-0">{icon}</div>
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-emerald-100/80 text-sm">{subtitle}</p>}
        </div>
      </div>
      <p className="text-sm text-emerald-100/70">{today}</p>
    </div>
  );
}
