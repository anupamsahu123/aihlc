import { useState } from "react";
import { Building2, ChevronUp, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { getMinistryData, type MinistryEntry } from "@/data/ministryData";

interface MinistryInsightsProps {
  activeFilter: "All" | "HLC-A" | "HLC-B";
}

function generateDetailedSummary(entry: MinistryEntry): string {
  const name = entry.departmentName ? `${entry.departmentName}, ${entry.ministryName}` : entry.ministryName;
  const parts: string[] = [];

  parts.push(`${name} is responsible for ${entry.total} recommendations under the assigned portfolio.`);

  if (entry.fullyImplemented.count > 0) {
    parts.push(`Of these, ${entry.fullyImplemented.count} recommendations (${entry.fullyImplemented.percentage}%) have been Fully Implemented through issuance of notifications, amendments to existing rules, operationalisation of schemes, grant of approvals, and issuance of guidelines or office memoranda as recorded in the dataset.`);
  }

  if (entry.inProgress.total > 0) {
    const stages: string[] = [];
    if (entry.inProgress.onTrack > 0) stages.push(`${entry.inProgress.onTrack} on track`);
    if (entry.inProgress.overdue > 0) stages.push(`${entry.inProgress.overdue} overdue`);
    parts.push(`Under Progress (${entry.inProgress.total} recommendations, ${entry.inProgress.percentage}%) are at various stages including Cabinet approval processes, EFC appraisal, inter-ministerial consultation, stakeholder consultation, regulatory examination, draft note circulation, and awaiting final approval from competent authorities. Of these, ${stages.join(" and ")}. The recommendations currently under progress are pending with the concerned Ministry/Department for finalisation of draft Cabinet Notes, securing regulatory clearances, and completion of inter-ministerial consultations as per recorded action taken entries.`);
  }

  if (entry.yetToInitiate.total > 0) {
    parts.push(`Yet to Initiate (${entry.yetToInitiate.total} recommendations, ${entry.yetToInitiate.percentage}%) remain under examination, under deliberation, or no further action has been taken as per the recorded data.${entry.yetToInitiate.overdue > 0 ? ` Of these, ${entry.yetToInitiate.overdue} are overdue beyond the approved timelines and require immediate attention from the implementing authority.` : ` All ${entry.yetToInitiate.onTrack} are within their approved timelines.`}`);
  }

  if (entry.fullyImplemented.count === 0 && entry.inProgress.total === 0) {
    parts.push(`No recommendations have been implemented or progressed. All ${entry.total} recommendations are pending initiation by the concerned Ministry/Department.`);
  }

  const totalOverdue = entry.inProgress.overdue + entry.yetToInitiate.overdue;
  if (totalOverdue > 0) {
    parts.push(`Overall, ${totalOverdue} recommendations are overdue and require escalation to the competent authority for expedited action.`);
  }

  parts.push(`Overall implementation rate: ${entry.fullyImplemented.percentage}%.`);

  return parts.join(" ");
}

// Color segments for the stacked bar
const getBarSegments = (entry: MinistryEntry) => {
  const segments: { width: number; color: string; label: string; count: number }[] = [];
  const total = entry.total;
  if (total === 0) return segments;

  if (entry.fullyImplemented.count > 0) {
    segments.push({ width: (entry.fullyImplemented.count / total) * 100, color: "bg-emerald-500", label: "Fully Implemented", count: entry.fullyImplemented.count });
  }
  if (entry.inProgress.onTrack > 0) {
    segments.push({ width: (entry.inProgress.onTrack / total) * 100, color: "bg-amber-400", label: "In Progress - On Track", count: entry.inProgress.onTrack });
  }
  if (entry.inProgress.overdue > 0) {
    segments.push({ width: (entry.inProgress.overdue / total) * 100, color: "bg-orange-500", label: "In Progress - Overdue", count: entry.inProgress.overdue });
  }
  if (entry.yetToInitiate.onTrack > 0) {
    segments.push({ width: (entry.yetToInitiate.onTrack / total) * 100, color: "bg-gray-300", label: "Yet to Initiate - Not Due", count: entry.yetToInitiate.onTrack });
  }
  if (entry.yetToInitiate.overdue > 0) {
    segments.push({ width: (entry.yetToInitiate.overdue / total) * 100, color: "bg-red-500", label: "Yet to Initiate - Overdue", count: entry.yetToInitiate.overdue });
  }

  return segments;
};

const MinistryInsights = ({ activeFilter }: MinistryInsightsProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const data = getMinistryData(activeFilter).sort((a, b) => b.total - a.total);
  const maxTotal = data.length > 0 ? data[0].total : 1;
  const MIN_BAR_PCT = 8; // minimum bar width percentage for small counts
  const THRESHOLD_RATIO = 0.15; // below this ratio of max, bars are equal (minimum) size

  const getBarWidth = (total: number) => {
    const ratio = total / maxTotal;
    if (ratio < THRESHOLD_RATIO) return MIN_BAR_PCT;
    // Scale linearly from MIN_BAR_PCT to 100
    return MIN_BAR_PCT + (ratio) * (100 - MIN_BAR_PCT);
  };

  const getKey = (entry: MinistryEntry) => `${entry.ministryId}-${entry.departmentId || "m"}`;
  const selectedEntry = selectedId ? data.find(d => getKey(d) === selectedId) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="card-gov"
    >
      {/* Header */}
      <div className="border-b border-border px-6 py-5">
        <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Ministry-Wise Insights
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {data.length} Ministries/Departments — click any row to view detailed summary
        </p>
      </div>

      {/* Stacked Bar Chart List */}
      <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
        {data.map((entry, idx) => {
          const key = getKey(entry);
          const name = entry.departmentName || entry.ministryName;
          const isSelected = selectedId === key;
          const segments = getBarSegments(entry);
          const barMaxWidth = (entry.total / maxTotal) * 100;

          return (
            <div key={`${key}-${idx}`}>
              <button
                onClick={() => setSelectedId(isSelected ? null : key)}
                className={`w-full grid grid-cols-[minmax(200px,280px)_1fr_60px] items-center gap-4 px-6 py-3.5 border-b border-border text-left transition-colors ${
                  isSelected ? "bg-primary/5" : "hover:bg-secondary/40"
                }`}
              >
                {/* Ministry Name */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate leading-tight">{name}</p>
                  {entry.departmentName && (
                    <p className="text-[11px] text-muted-foreground truncate">{entry.ministryName}</p>
                  )}
                </div>

                {/* Stacked Bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex h-7 rounded overflow-hidden" style={{ width: `${barMaxWidth}%` }}>
                    {segments.map((seg, i) => (
                      <div
                        key={i}
                        className={`${seg.color} flex items-center justify-center text-[10px] font-bold text-white transition-all`}
                        style={{ width: `${(seg.count / entry.total) * 100}%`, minWidth: seg.count > 0 ? "24px" : "0" }}
                        title={`${seg.label}: ${seg.count}`}
                      >
                        {seg.count > 0 && seg.count}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total + Chevron */}
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-base font-bold text-foreground">{entry.total}</span>
                  {isSelected ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded Detail Summary */}
              <AnimatePresence>
                {isSelected && selectedEntry && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden border-b border-border"
                  >
                    <div className="px-6 py-5 bg-secondary/30">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-sm font-semibold text-foreground">
                          {selectedEntry.departmentName ? `${selectedEntry.departmentName}, ${selectedEntry.ministryName}` : selectedEntry.ministryName}
                        </h3>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {generateDetailedSummary(selectedEntry)}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-6 py-4 border-t border-border flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-emerald-500" /> Fully Implemented</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-amber-400" /> Under Progress - On Track</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-orange-500" /> Under Progress - Overdue</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-gray-300" /> Yet to Initiate - Not Due</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-red-500" /> Yet to Initiate - Overdue</span>
      </div>
    </motion.div>
  );
};

export default MinistryInsights;
