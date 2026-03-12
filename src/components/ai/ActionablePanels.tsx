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
      color: "border-l-destructive",
      items: recommendations.filter(r => r.delayDays > 60 || r.implementationStatus === "No action"),
    },
    {
      title: "Pending with NITI",
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
      title: "Strong Closure",
      icon: CheckCircle2,
      color: "border-l-gov-green",
      items: recommendations.filter(r => r.implementationStatus === "Fully implemented" && r.hasJustificationDoc),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="card-gov"
    >
      <div className="border-b border-border px-6 py-5">
        <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-gov-purple" />
          Action Items
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Categorized priorities for review</p>
      </div>
      <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-4">
        {panels.map((panel) => (
          <div key={panel.title} className={`rounded-xl border border-border border-l-4 ${panel.color} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <panel.icon className="h-5 w-5 text-foreground" />
                <span className="text-sm font-semibold text-foreground">{panel.title}</span>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                {panel.items.length}
              </span>
            </div>
            {panel.items.length === 0 ? (
              <p className="text-xs text-muted-foreground">No items</p>
            ) : (
              <div className="space-y-2">
                {panel.items.slice(0, 3).map(rec => (
                  <button
                    key={rec.id}
                    onClick={() => onSelectRec(rec)}
                    className="w-full text-left rounded-lg bg-secondary/50 px-3 py-2 text-xs hover:bg-accent transition-colors"
                  >
                    <span className="font-bold text-primary">{rec.serialNo}</span>
                    <span className="text-muted-foreground ml-2">{rec.description.substring(0, 50)}...</span>
                  </button>
                ))}
                {panel.items.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">+{panel.items.length - 3} more</p>
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
