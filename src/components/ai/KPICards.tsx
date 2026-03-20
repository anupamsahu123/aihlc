import {
  CheckCircle2, Clock, AlertTriangle, Hourglass,
  Building2, BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import { getMinistryData, computeAggregates } from "@/data/ministryData";
import type { Recommendation } from "@/data/hlcTypes";
import { recommendations } from "@/data/hlcMockData";

interface KPICardsProps {
  activeFilter: "All" | "HLC-A" | "HLC-B";
  onDrillDown: (title: string, items: Recommendation[]) => void;
}

const KPICards = ({ activeFilter, onDrillDown }: KPICardsProps) => {
  const data = getMinistryData(activeFilter);
  const agg = computeAggregates(data);

  const filteredRecs = activeFilter === "All" ? recommendations :
    recommendations.filter(r => r.hlcType === activeFilter);

  const fullyImplRecs = filteredRecs.filter(r => r.implementationStatus === "Fully implemented");
  const underProgRecs = filteredRecs.filter(r => r.implementationStatus === "Under progress" || r.implementationStatus === "Partially implemented");
  const yetToInitRecs = filteredRecs.filter(r => r.implementationStatus === "Yet to initiate" || r.implementationStatus === "No action");
  const overdueRecs = filteredRecs.filter(r => r.delayDays > 0);

  const cards = [
    { label: "Total", value: agg.total, icon: BarChart3, color: "text-primary", bg: "bg-gov-blue-muted", drillTitle: "All Recommendations", items: filteredRecs },
    { label: "Implemented", value: agg.fullyImplemented, icon: CheckCircle2, color: "text-gov-green", bg: "bg-gov-green-light", drillTitle: "Fully Implemented Recommendations", items: fullyImplRecs },
    { label: "In Progress", value: agg.inProgress, icon: Clock, color: "text-gov-amber", bg: "bg-gov-amber-light", drillTitle: "Recommendations In Progress", items: underProgRecs },
    { label: "Yet to Initiate", value: agg.yetToInitiate, icon: Hourglass, color: "text-gov-orange", bg: "bg-gov-orange-light", drillTitle: "Recommendations Yet to Initiate", items: yetToInitRecs },
    { label: "Overdue", value: agg.overdue, icon: AlertTriangle, color: "text-destructive", bg: "bg-gov-red-light", drillTitle: "Overdue Recommendations", items: overdueRecs },
    { label: "Ministries", value: agg.ministryCount, icon: Building2, color: "text-gov-indigo", bg: "bg-gov-purple-light", drillTitle: "", items: [] },
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
        </motion.div>
      ))}
    </div>
  );
};

export default KPICards;
