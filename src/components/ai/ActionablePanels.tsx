import { Eye, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import { recommendations } from "@/data/hlcMockData";
import { motion } from "framer-motion";
import type { Recommendation } from "@/data/hlcTypes";

interface ActionablePanelsProps {
  onSelectRec: (rec: Recommendation) => void;
}

const ActionablePanels = ({ onSelectRec }: ActionablePanelsProps) => {
  const panels = [
    {
      title: "Needs Immediate Review",
      icon: Eye,
      color: "border-l-gov-red",
      items: recommendations.filter(r => r.delayDays > 60 || r.implementationStatus === "No action"),
    },
    {
      title: "Pending with NITI Approver",
      icon: Clock,
      color: "border-l-gov-purple",
      items: recommendations.filter(r => r.currentOwner === "NITI Approver" && r.implementationStatus !== "Fully implemented"),
    },
    {
      title: "Pending with Ministry",
      icon: Clock,
      color: "border-l-gov-amber",
      items: recommendations.filter(r => (r.currentOwner === "Ministry Director" || r.currentOwner === "Ministry Approver") && r.implementationStatus !== "Fully implemented"),
    },
    {
      title: "Strong Closure Evidence",
      icon: CheckCircle2,
      color: "border-l-gov-green",
      items: recommendations.filter(r => r.implementationStatus === "Fully implemented" && r.hasJustificationDoc),
    },
    {
      title: "No Action Text Available",
      icon: XCircle,
      color: "border-l-gov-orange",
      items: recommendations.filter(r => !r.detailsOfActionTaken || r.detailsOfActionTaken.trim() === ""),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="card-gov"
    >
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-gov-purple" />
          Actionable AI Insights
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">Smart categorization for executive review priorities</p>
      </div>
      <div className="grid gap-3 p-6 md:grid-cols-2 lg:grid-cols-3">
        {panels.map((panel) => (
          <div key={panel.title} className={`rounded-lg border border-border border-l-4 ${panel.color} p-4`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <panel.icon className="h-4 w-4 text-foreground" />
                <span className="text-xs font-semibold text-foreground">{panel.title}</span>
              </div>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {panel.items.length}
              </span>
            </div>
            {panel.items.length === 0 ? (
              <p className="text-[10px] text-muted-foreground">No items in this category</p>
            ) : (
              <div className="space-y-1.5">
                {panel.items.slice(0, 3).map(rec => (
                  <button
                    key={rec.id}
                    onClick={() => onSelectRec(rec)}
                    className="w-full text-left rounded-md bg-secondary/50 px-2.5 py-1.5 text-[11px] hover:bg-accent transition-colors"
                  >
                    <span className="font-semibold text-primary">{rec.serialNo}</span>
                    <span className="text-muted-foreground ml-1.5">{rec.description.substring(0, 60)}...</span>
                  </button>
                ))}
                {panel.items.length > 3 && (
                  <p className="text-[10px] text-muted-foreground text-center">+{panel.items.length - 3} more</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ActionablePanels;
