import { AlertTriangle, Clock, RotateCcw, ArrowRightLeft, Pause } from "lucide-react";
import { recommendations } from "@/data/hlcMockData";
import { motion } from "framer-motion";
import type { RiskLevel } from "@/data/hlcTypes";

const RiskSnapshot = () => {
  const now = new Date("2026-03-12");

  const risks = [
    {
      category: "Overdue Recommendations",
      icon: AlertTriangle,
      severity: "High" as RiskLevel,
      items: recommendations.filter(r => r.delayDays > 0).map(r => r.serialNo),
      color: "border-l-gov-red bg-gov-red-light/50",
    },
    {
      category: "Due Within 10 Days",
      icon: Clock,
      severity: "High" as RiskLevel,
      items: recommendations.filter(r => {
        const diff = Math.ceil((r.timelineDateObj.getTime() - now.getTime()) / 86400000);
        return diff > 0 && diff <= 10;
      }).map(r => r.serialNo),
      color: "border-l-gov-orange bg-gov-orange-light/50",
    },
    {
      category: "Long-Pending, No Recent Update",
      icon: Pause,
      severity: "Medium" as RiskLevel,
      items: recommendations.filter(r => r.updates.length === 0 && r.implementationStatus !== "Fully implemented").map(r => r.serialNo),
      color: "border-l-gov-amber bg-gov-amber-light/50",
    },
    {
      category: "Stuck in Approval Workflow",
      icon: ArrowRightLeft,
      severity: "Medium" as RiskLevel,
      items: recommendations.filter(r => r.currentOwner === "Ministry Approver" && r.implementationStatus !== "Fully implemented").map(r => r.serialNo),
      color: "border-l-gov-purple bg-gov-purple-light/50",
    },
    {
      category: "Repeated Under-Progress, No Closure",
      icon: RotateCcw,
      severity: "Medium" as RiskLevel,
      items: recommendations.filter(r => r.updates.length >= 2 && r.implementationStatus === "Under progress").map(r => r.serialNo),
      color: "border-l-gov-teal bg-gov-teal-light/50",
    },
  ];

  const severityBadge = (s: RiskLevel) => {
    const cls = s === "High" ? "bg-gov-red text-primary-foreground" : s === "Medium" ? "bg-gov-amber text-foreground" : "bg-gov-green text-primary-foreground";
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>{s}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="card-gov"
    >
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-gov-red" />
          Recommendation Risk Snapshot
        </h2>
      </div>
      <div className="grid gap-3 p-6 md:grid-cols-2 lg:grid-cols-3">
        {risks.map((risk) => (
          <div
            key={risk.category}
            className={`rounded-lg border-l-4 p-4 ${risk.color}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <risk.icon className="h-4 w-4 text-foreground" />
                <span className="text-xs font-semibold text-foreground">{risk.category}</span>
              </div>
              {severityBadge(risk.severity)}
            </div>
            <div className="text-2xl font-bold font-display text-foreground mb-1">{risk.items.length}</div>
            {risk.items.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {risk.items.slice(0, 4).map(id => (
                  <span key={id} className="rounded bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-border">
                    {id}
                  </span>
                ))}
                {risk.items.length > 4 && (
                  <span className="rounded bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground border border-border">
                    +{risk.items.length - 4} more
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground">No items in this category</span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default RiskSnapshot;
