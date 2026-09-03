"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Persistent left-sidebar dashboard layout (nav items + content pane),
 * built on the existing Tabs primitive so section-switching stays
 * client-side with no extra routing/data-fetching changes. Used by both
 * the admin and doctor dashboards for a consistent look.
 */
export function DashboardShell({ navItems, defaultValue, children }) {
  return (
    <Tabs defaultValue={defaultValue} className="flex flex-col md:flex-row gap-6 items-start">
      <TabsList className="w-full md:w-60 md:sticky md:top-24 shrink-0 bg-muted/30 border rounded-lg p-2 flex flex-row md:flex-col h-auto gap-1 overflow-x-auto md:overflow-visible">
        {navItems.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className="w-full justify-start gap-2 px-4 py-3 whitespace-nowrap"
          >
            {item.icon}
            <span>{item.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="flex-1 w-full min-w-0">{children}</div>
    </Tabs>
  );
}
