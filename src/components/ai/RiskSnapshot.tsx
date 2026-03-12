import { AlertTriangle, Clock, Pause, ArrowRightLeft } from "lucide-react";
import { recommendations } from "@/data/hlcMockData";
import { motion } from "framer-motion";
import type { RiskLevel } from "@/data/hlcTypes";

const RiskSnapshot = () => {
  const now = new Date("2026-03-12");

  const risks = [
    {
      category: "Overdue",
      description: "Recommendations past their deadline",
      icon: AlertTriangle,
      severity: "High" as RiskLevel,
      count: recommendations.filter(r => r.delayDays > 0).length,
      color: "border-l-destructive bg-gov-red-light/40",
      iconColor: "text-destructive",
    },
    {
      category: "Due Within 10 Days",
      description: "Approaching deadline soon",
      icon: Clock,
      severity: "High" as RiskLevel,
      count: recommendations.filter(r => {
        const diff = Math.ceil((r.timelineDateObj.getTime() - now.getTime()) / 86400000);
        return diff > 0 && diff <= 10;
      }).length,
      color: "border-l-gov-orange bg-gov-orange-light/40",
      iconColor: "text-gov-orange",
    },
    {
      category: "No Recent Update",
      description: "Long-pending with no activity",
      icon: Pause,
      severity: "Medium" as RiskLevel,
      count: recommendations.filter(r => r.updates.length === 0 && r.implementationStatus !== "Fully implemented").length,
      color: "border-l-gov-amber bg-gov-amber-light/40",
      iconColor: "text-gov-amber",
    },
    {
      category: "Stuck in Approval",
      description: "Waiting for approval action",
      icon: ArrowRightLeft,
      severity: "Medium" as RiskLevel,
      count: recommendations.filter(r => r.currentOwner === "Ministry Approver" && r.implementationStatus !== "Fully implemented").length,
      color: "border-l-gov-purple bg-gov-purple-light/40",
      iconColor: "text-gov-purple",
    },
  ];

  const severityBadge = (s: RiskLevel) => {
    const cls = s === "High" ? "bg-destructive text-primary-foreground" : "bg-gov-amber text-foreground";
    return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{s}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="card-gov"
    >
      <div className="border-b border-border px-6 py-5">
        <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Risk Watchlist
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Items requiring immediate attention</p>
      </div>
      <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-4">
        {risks.map((risk) => (
          <div key={risk.category} className={`rounded-xl border-l-4 p-5 ${risk.color}`}>
            <div className="flex items-center justify-between mb-3">
              <risk.icon className={`h-5 w-5 ${risk.iconColor}`} />
              {severityBadge(risk.severity)}
            </div>
            <p className="font-display text-3xl font-bold text-foreground mb-1">{risk.count}</p>
            <p className="text-sm font-semibold text-foreground">{risk.category}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{risk.description}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default RiskSnapshot;
