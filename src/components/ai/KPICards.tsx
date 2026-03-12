import {
  CheckCircle2, Clock, AlertTriangle, XCircle, BarChart3,
  Building2, Timer, TrendingDown, CircleDot, Hourglass
} from "lucide-react";
import { recommendations } from "@/data/hlcMockData";
import { motion } from "framer-motion";

const KPICards = () => {
  const total = recommendations.length;
  const fullyImpl = recommendations.filter(r => r.implementationStatus === "Fully implemented").length;
  const partialImpl = recommendations.filter(r => r.implementationStatus === "Partially implemented").length;
  const underProg = recommendations.filter(r => r.implementationStatus === "Under progress").length;
  const yetToInit = recommendations.filter(r => r.implementationStatus === "Yet to initiate").length;
  const noAction = recommendations.filter(r => r.implementationStatus === "No action").length;
  const overdue = recommendations.filter(r => r.delayDays > 0).length;
  const nearDue = recommendations.filter(r => {
    const diff = Math.ceil((r.timelineDateObj.getTime() - new Date("2026-03-12").getTime()) / 86400000);
    return diff > 0 && diff <= 10;
  }).length;
  const avgDelay = Math.round(recommendations.filter(r => r.delayDays > 0).reduce((s, r) => s + r.delayDays, 0) / (overdue || 1));
  const ministries = new Set(recommendations.map(r => r.primaryMinistry)).size;

  const cards = [
    { label: "Total Recommendations", value: total, icon: BarChart3, color: "text-gov-blue", bg: "bg-gov-blue-muted", trend: "HLC-B portfolio" },
    { label: "Fully Implemented", value: fullyImpl, icon: CheckCircle2, color: "text-gov-green", bg: "bg-gov-green-light", trend: `${Math.round(fullyImpl/total*100)}% completion rate` },
    { label: "Partially Implemented", value: partialImpl, icon: CircleDot, color: "text-gov-teal", bg: "bg-gov-teal-light", trend: "Needs closure follow-up" },
    { label: "Under Progress", value: underProg, icon: Clock, color: "text-gov-amber", bg: "bg-gov-amber-light", trend: "Active ministry engagement" },
    { label: "Yet to Initiate", value: yetToInit, icon: Hourglass, color: "text-gov-orange", bg: "bg-gov-orange-light", trend: "Requires escalation" },
    { label: "No Action", value: noAction, icon: XCircle, color: "text-gov-red", bg: "bg-gov-red-light", trend: "Critical — immediate attention" },
    { label: "Overdue", value: overdue, icon: AlertTriangle, color: "text-gov-red", bg: "bg-gov-red-light", trend: `Avg delay: ${avgDelay} days` },
    { label: "Due in <10 Days", value: nearDue, icon: Timer, color: "text-gov-purple", bg: "bg-gov-purple-light", trend: "Monitor closely" },
    { label: "Avg Delay (days)", value: avgDelay, icon: TrendingDown, color: "text-gov-orange", bg: "bg-gov-orange-light", trend: "Across overdue items" },
    { label: "Ministries Involved", value: ministries, icon: Building2, color: "text-gov-indigo", bg: "bg-gov-purple-light", trend: "Active departments" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.04 }}
          className="card-gov cursor-pointer p-4 hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-start justify-between mb-2">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.bg}`}>
              <card.icon className={`h-4.5 w-4.5 ${card.color}`} />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">{card.value}</span>
          </div>
          <p className="text-xs font-medium text-foreground mb-0.5">{card.label}</p>
          <p className="text-[10px] text-muted-foreground">{card.trend}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default KPICards;
