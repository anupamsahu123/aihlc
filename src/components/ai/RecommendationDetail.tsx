import { X, Copy, Download, Sparkles, Building2, Calendar, User, AlertTriangle, CheckCircle2, Clock, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import type { Recommendation } from "@/data/hlcTypes";
import { aiSummaryForRec } from "@/data/hlcMockData";

interface RecommendationDetailProps {
  recommendation: Recommendation;
  onClose: () => void;
}

const RecommendationDetail = ({ recommendation: rec, onClose }: RecommendationDetailProps) => {
  const statusColor: Record<string, string> = {
    "Fully implemented": "bg-gov-green text-primary-foreground",
    "Partially implemented": "bg-gov-teal text-primary-foreground",
    "Under progress": "bg-gov-amber text-foreground",
    "Yet to initiate": "bg-gov-orange text-primary-foreground",
    "No action": "bg-gov-red text-primary-foreground",
  };

  const riskColor: Record<string, string> = {
    High: "bg-gov-red-light text-gov-red",
    Medium: "bg-gov-amber-light text-gov-amber",
    Low: "bg-gov-green-light text-gov-green",
  };

  const timelineDotColor = (status: string) => {
    if (status.includes("Fully")) return "bg-gov-green";
    if (status.includes("Partially")) return "bg-gov-teal";
    if (status.includes("Under")) return "bg-gov-amber";
    return "bg-gov-orange";
  };

  const aiInterpretations = [
    { label: "What has been done till date", content: rec.detailsOfActionTaken || "No action details available." },
    { label: "What is still pending", content: rec.implementationStatus === "Fully implemented" ? "Nothing — recommendation is fully implemented." : rec.reasonIfNotImplemented || "Full implementation closure with documentary evidence." },
    { label: "Why this is delayed", content: rec.delayDays > 0 ? `Overdue by ${rec.delayDays} days. ${rec.reasonIfNotImplemented || "Dependencies on inter-ministerial consultation or legislative process."}` : "Not delayed — within timeline or already closed." },
    { label: "What should happen next", content: rec.implementationStatus === "Fully implemented" ? "NITI Approver should verify and accept closure." : "Ministry should expedite action and submit updated status with supporting documents." },
    { label: "Current workflow holder", content: rec.currentOwner },
    { label: "Expected closure path", content: rec.implementationStatus === "Fully implemented" ? "Acceptance by reviewing authority." : "Complete action → Ministry Director review → Ministry Approver verification → NITI Approver acceptance." },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto bg-card shadow-gov-xl scrollbar-thin"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-border bg-card px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold text-primary">{rec.serialNo}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusColor[rec.implementationStatus]}`}>
                  {rec.implementationStatus}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${riskColor[rec.riskLevel]}`}>
                  {rec.riskLevel} Risk
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="text-muted-foreground"><Copy className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground"><Download className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{rec.description}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{rec.recommendationText}</p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Building2, label: "Primary Ministry", value: rec.primaryMinistry },
                { icon: Building2, label: "Implementing Ministry", value: rec.implementingMinistry },
                { icon: Calendar, label: "Timeline", value: rec.timeline },
                { icon: Calendar, label: "Updated Timeline", value: rec.updatedTimeline || "—" },
                { icon: User, label: "Currently With", value: rec.currentOwner },
                { icon: AlertTriangle, label: "Delay Days", value: rec.delayDays > 0 ? `${rec.delayDays} days` : "On track" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-secondary/50 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <item.icon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</span>
                  </div>
                  <p className="text-xs font-medium text-foreground">{item.value}</p>
                </div>
              ))}
            </div>

            {/* AI Summary */}
            <div className="rounded-xl bg-gov-blue-muted/50 border border-gov-blue/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-gov-blue" />
                <span className="text-sm font-semibold text-foreground">AI Interpretation</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{aiSummaryForRec(rec)}</p>
            </div>

            {/* AI Panels */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detailed Analysis</h4>
              {aiInterpretations.map((panel) => (
                <div key={panel.label} className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ArrowRight className="h-3 w-3 text-primary" />
                    <span className="text-[11px] font-semibold text-foreground">{panel.label}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed pl-4.5">{panel.content}</p>
                </div>
              ))}
            </div>

            {/* Timeline */}
            {rec.updates.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recommendation Journey</h4>
                <div className="relative pl-6">
                  <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
                  {rec.updates.map((update, i) => (
                    <div key={i} className="relative mb-5 last:mb-0">
                      <div className={`absolute -left-6 top-1 h-[18px] w-[18px] rounded-full border-2 border-card ${timelineDotColor(update.status)}`} />
                      <div className="rounded-lg bg-secondary/50 p-3 ml-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-semibold text-primary">{update.date}</span>
                          <span className="text-[10px] text-muted-foreground">• {update.actorRole}</span>
                          {update.outcome && (
                            <span className="rounded-full bg-gov-green-light px-1.5 py-0.5 text-[9px] font-semibold text-gov-green">{update.outcome}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{update.actionText}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source Text */}
            {rec.detailsOfActionTaken && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Source Action Text
                </h4>
                <div className="rounded-lg bg-muted p-3 text-[11px] text-muted-foreground leading-relaxed">
                  {rec.detailsOfActionTaken}
                </div>
              </div>
            )}

            <div className="flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5">
              <Sparkles className="h-3 w-3 text-gov-blue" />
              <span className="text-[10px] text-muted-foreground">
                AI-generated interpretation. Verify with source records before official action.
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RecommendationDetail;
