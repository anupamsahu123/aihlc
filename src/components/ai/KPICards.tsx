import {
  CheckCircle2, Clock, AlertTriangle, XCircle,
  Building2, Timer, Hourglass, BarChart3
} from "lucide-react";
import { recommendations } from "@/data/hlcMockData";
import { motion } from "framer-motion";

const KPICards = () => {
  const total = recommendations.length;
  const fullyImpl = recommendations.filter(r => r.implementationStatus === "Fully implemented").length;
  const underProg = recommendations.filter(r => r.implementationStatus === "Under progress" || r.implementationStatus === "Partially implemented").length;
  const yetToInit = recommendations.filter(r => r.implementationStatus === "Yet to initiate" || r.implementationStatus === "No action").length;
  const overdue = recommendations.filter(r => r.delayDays > 0).length;
  const ministries = new Set(recommendations.map(r => r.primaryMinistry)).size;

  const cards = [
    { label: "Total", value: total, icon: BarChart3, color: "text-primary", bg: "bg-gov-blue-muted", note: "All recommendations" },
    { label: "Implemented", value: fullyImpl, icon: CheckCircle2, color: "text-gov-green", bg: "bg-gov-green-light", note: `${Math.round(fullyImpl / total * 100)}% complete` },
    { label: "In Progress", value: underProg, icon: Clock, color: "text-gov-amber", bg: "bg-gov-amber-light", note: "Active work ongoing" },
    { label: "Not Started", value: yetToInit, icon: Hourglass, color: "text-gov-orange", bg: "bg-gov-orange-light", note: "Needs attention" },
    { label: "Overdue", value: overdue, icon: AlertTriangle, color: "text-destructive", bg: "bg-gov-red-light", note: "Past deadline" },
    { label: "Ministries", value: ministries, icon: Building2, color: "text-gov-indigo", bg: "bg-gov-purple-light", note: "Departments involved" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="card-gov p-5 text-center cursor-pointer hover:scale-[1.03] transition-transform"
        >
          <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
            <card.icon className={`h-6 w-6 ${card.color}`} />
          </div>
          <p className="font-display text-3xl font-bold text-foreground">{card.value}</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{card.label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{card.note}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default KPICards;
