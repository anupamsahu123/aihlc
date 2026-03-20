import { useState } from "react";
import {
  CheckCircle2, Clock, AlertTriangle, Hourglass,
  Building2, BarChart3, X, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getMinistryData, computeAggregates } from "@/data/ministryData";
import type { Recommendation } from "@/data/hlcTypes";
import { recommendations } from "@/data/hlcMockData";
import { Button } from "@/components/ui/button";

interface KPICardsProps {
  activeFilter: "All" | "HLC-A" | "HLC-B";
  onDrillDown: (title: string, items: Recommendation[]) => void;
}

function generateStatusSummary(
  label: string,
  activeFilter: "All" | "HLC-A" | "HLC-B",
  agg: ReturnType<typeof computeAggregates>,
  ministryCount: number
): string {
  const portfolio = activeFilter === "All" ? "HLC-A and HLC-B (NFRR)" : activeFilter === "HLC-A" ? "HLC-A (Viksit Bharat)" : "HLC-B (NFRR)";

  if (label === "Total") {
    return `The ${portfolio} recommendation portfolio comprises ${agg.total} recommendations across ${ministryCount} Ministries/Departments. Of the total, ${agg.fullyImplemented} recommendations are Fully Implemented, ${agg.inProgress} are Under Progress at various stages of approval and consultation, ${agg.yetToInitiate} are Yet to Initiate, and ${agg.overdue} are currently overdue beyond their approved timelines. The portfolio spans ${ministryCount} Ministries/Departments with implementation activity recorded across all status categories.`;
  }
  if (label === "Implemented") {
    return `A total of ${agg.fullyImplemented} recommendations under the ${portfolio} portfolio have been Fully Implemented. These recommendations have been completed through issuance of notifications, amendments to existing rules, operationalisation of schemes, grant of approvals, and issuance of guidelines or office memoranda as recorded in the dataset. The implemented recommendations span multiple Ministries/Departments, reflecting closure actions including gazette notifications, executive orders, and policy circulars duly approved by competent authorities.`;
  }
  if (label === "In Progress") {
    return `A total of ${agg.inProgress} recommendations under the ${portfolio} portfolio are currently Under Progress. These recommendations are at various stages including Cabinet approval processes, EFC appraisal, inter-ministerial consultation, stakeholder consultation, regulatory examination, draft note circulation, evaluation studies, issuance of notifications, or are awaiting final approval from competent authorities as per recorded action taken entries. Major pending actions include finalisation of draft Cabinet Notes, completion of inter-ministerial consultations, obtaining EFC clearance, and securing regulatory approvals.`;
  }
  if (label === "Yet to Initiate") {
    return `A total of ${agg.yetToInitiate} recommendations under the ${portfolio} portfolio are classified as Yet to Initiate. These recommendations remain under examination, under deliberation, or no further action has been taken as per the recorded data. The pending recommendations are distributed across multiple Ministries/Departments and require initiation of appropriate administrative processes including constitution of committees, drafting of proposals, and commencement of stakeholder consultations as applicable.`;
  }
  if (label === "Overdue") {
    return `A total of ${agg.overdue} recommendations under the ${portfolio} portfolio are currently overdue beyond their approved timelines across ${ministryCount} Ministries/Departments. These overdue recommendations require immediate attention and escalation to the concerned competent authorities for expeditious resolution. The overdue items span multiple implementation stages including pending approvals, delayed consultations, and awaiting regulatory clearances as recorded in the dataset.`;
  }
  if (label === "Ministries") {
    return `The ${portfolio} recommendation portfolio covers ${ministryCount} Ministries/Departments. The distribution of recommendations across these entities reflects the cross-sectoral nature of the reform agenda, with the highest concentration in infrastructure, finance, and industrial development sectors. Each Ministry/Department has been assigned specific recommendations based on their functional domain and administrative jurisdiction.`;
  }
  return "";
}

const KPICards = ({ activeFilter, onDrillDown }: KPICardsProps) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
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

  const handleCardClick = (label: string) => {
    setExpandedCard(prev => prev === label ? null : label);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={`card-gov p-5 text-center cursor-pointer transition-all ${
              expandedCard === card.label
                ? "ring-2 ring-primary shadow-lg scale-[1.03]"
                : "hover:scale-[1.03]"
            }`}
            onClick={() => handleCardClick(card.label)}
          >
            <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <p className="font-display text-3xl font-bold text-foreground">{card.value}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {expandedCard && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="card-gov overflow-hidden">
              <div className="border-b border-border bg-gradient-to-r from-gov-blue-muted to-card px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {expandedCard} — Summary
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); setExpandedCard(null); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="px-6 py-5 space-y-3">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {generateStatusSummary(expandedCard, activeFilter, agg, agg.ministryCount)}
                </p>
                <div className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    AI-generated summary as of 20 March 2026. Computed strictly from structured dataset.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KPICards;
