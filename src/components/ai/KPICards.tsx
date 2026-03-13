import {
  CheckCircle2, Clock, AlertTriangle, XCircle,
  Building2, Timer, Hourglass, BarChart3
} from "lucide-react";
import { recommendations } from "@/data/hlcMockData";
import { motion } from "framer-motion";
import type { Recommendation } from "@/data/hlcTypes";

interface KPICardsProps {
  onDrillDown: (title: string, items: Recommendation[]) => void;
}

const KPICards = ({ onDrillDown }: KPICardsProps) => {
  const total = recommendations.length;
  const fullyImplRecs = recommendations.filter(r => r.implementationStatus === "Fully implemented");
  const underProgRecs = recommendations.filter(r => r.implementationStatus === "Under progress" || r.implementationStatus === "Partially implemented");
  const yetToInitRecs = recommendations.filter(r => r.implementationStatus === "Yet to initiate" || r.implementationStatus === "No action");
  const overdueRecs = recommendations.filter(r => r.delayDays > 0);
  const ministries = new Set(recommendations.map(r => r.primaryMinistry)).size;

  const cards = [
    { label: "Total", value: total, icon: BarChart3, color: "text-primary", bg: "bg-gov-blue-muted", note: "All recommendations", items: recommendations, drillTitle: "All Recommendations" },
    { label: "Implemented", value: fullyImplRecs.length, icon: CheckCircle2, color: "text-gov-green", bg: "bg-gov-green-light", note: `${Math.round(fullyImplRecs.length / total * 100)}% complete`, items: fullyImplRecs, drillTitle: "Fully Implemented Recommendations" },
    { label: "In Progress", value: underProgRecs.length, icon: Clock, color: "text-gov-amber", bg: "bg-gov-amber-light", note: "Active work ongoing", items: underProgRecs, drillTitle: "Recommendations In Progress" },
    { label: "Not Started", value: yetToInitRecs.length, icon: Hourglass, color: "text-gov-orange", bg: "bg-gov-orange-light", note: "Needs attention", items: yetToInitRecs, drillTitle: "Recommendations Not Yet Started" },
    { label: "Overdue", value: overdueRecs.length, icon: AlertTriangle, color: "text-destructive", bg: "bg-gov-red-light", note: "Past deadline", items: overdueRecs, drillTitle: "Overdue Recommendations" },
    { label: "Ministries", value: ministries, icon: Building2, color: "text-gov-indigo", bg: "bg-gov-purple-light", note: "Departments involved", items: [], drillTitle: "" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className={`card-gov p-5 text-center transition-transform ${card.items.length > 0 ? "cursor-pointer hover:scale-[1.03]" : ""}`}
          onClick={() => card.items.length > 0 && onDrillDown(card.drillTitle, card.items)}
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
