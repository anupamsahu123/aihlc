import { AlertTriangle, Clock, Pause, ArrowRightLeft } from "lucide-react";
import { recommendations } from "@/data/hlcMockData";
import { motion } from "framer-motion";
import type { RiskLevel, Recommendation } from "@/data/hlcTypes";

interface RiskSnapshotProps {
  activeFilter: "All" | "HLC-A" | "HLC-B";
  onDrillDown: (title: string, items: Recommendation[]) => void;
}

const RiskSnapshot = ({ activeFilter, onDrillDown }: RiskSnapshotProps) => {
  const now = new Date("2026-03-12");
  const filtered = activeFilter === "All" ? recommendations :
    recommendations.filter(r => r.hlcType === activeFilter);

  const overdueItems = filtered.filter(r => r.delayDays > 0);
  const nearDueItems = filtered.filter(r => {
    const diff = Math.ceil((r.timelineDateObj.getTime() - now.getTime()) / 86400000);
    return diff > 0 && diff <= 10;
  });
  const noUpdateItems = filtered.filter(r => r.updates.length === 0 && r.implementationStatus !== "Fully implemented");
  const stuckItems = filtered.filter(r => r.currentOwner === "Ministry Approver" && r.implementationStatus !== "Fully implemented");

  const risks = [
    { category: "Overdue", description: "Past deadline", icon: AlertTriangle, severity: "High" as RiskLevel, count: overdueItems.length, color: "border-l-destructive bg-gov-red-light/40", iconColor: "text-destructive", items: overdueItems },
    { category: "Due Within 10 Days", description: "Approaching soon", icon: Clock, severity: "High" as RiskLevel, count: nearDueItems.length, color: "border-l-gov-orange bg-gov-orange-light/40", iconColor: "text-gov-orange", items: nearDueItems },
    { category: "No Recent Update", description: "No activity recorded", icon: Pause, severity: "Medium" as RiskLevel, count: noUpdateItems.length, color: "border-l-gov-amber bg-gov-amber-light/40", iconColor: "text-gov-amber", items: noUpdateItems },
    { category: "Stuck in Approval", description: "Awaiting approval", icon: ArrowRightLeft, severity: "Medium" as RiskLevel, count: stuckItems.length, color: "border-l-gov-purple bg-gov-purple-light/40", iconColor: "text-gov-purple", items: stuckItems },
  ];

  const severityBadge = (s: RiskLevel) => {
    const cls = s === "High" ? "bg-destructive text-primary-foreground" : "bg-gov-amber text-foreground";
    return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{s}</span>;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="card-gov">
      <div className="border-b border-border px-6 py-5">
        <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Risk Watchlist
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Click any count to view detailed recommendations</p>
      </div>
      <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-4">
        {risks.map((risk) => (
          <div
            key={risk.category}
            className={`rounded-xl border-l-4 p-5 ${risk.color} ${risk.count > 0 ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
            onClick={() => risk.count > 0 && onDrillDown(`Risk: ${risk.category}`, risk.items)}
          >
            <div className="flex items-center justify-between mb-3">
              <risk.icon className={`h-5 w-5 ${risk.iconColor}`} />
              {severityBadge(risk.severity)}
            </div>
            <p className={`font-display text-3xl font-bold text-foreground mb-1 ${risk.count > 0 ? "underline decoration-dotted underline-offset-4" : ""}`}>{risk.count}</p>
            <p className="text-sm font-semibold text-foreground">{risk.category}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{risk.description}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default RiskSnapshot;
