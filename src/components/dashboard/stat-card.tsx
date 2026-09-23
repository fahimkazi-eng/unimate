import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}

/** Compact KPI card used across the dashboard. */
export function StatCard({ icon: Icon, label, value, hint }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      {hint ? (
        <p className="mt-1 truncate text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </Card>
  );
}