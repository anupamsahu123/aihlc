import { useState } from "react";
import { Building2, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { getMinistryData, type MinistryEntry } from "@/data/ministryData";

interface MinistryInsightsProps {
  activeFilter: "All" | "HLC-A" | "HLC-B";
}

function generateMinistrySummary(entry: MinistryEntry): string {
  const name = entry.departmentName ? `${entry.departmentName}, ${entry.ministryName}` : entry.ministryName;
  const parts: string[] = [];
  parts.push(`${name} is responsible for ${entry.total} recommendations.`);
  if (entry.fullyImplemented.count > 0) {
    parts.push(`Fully Implemented (${entry.fullyImplemented.count}) through notifications, amendments, approvals, and operationalisation.`);
  }
  if (entry.inProgress.total > 0) {
    parts.push(`Under Progress (${entry.inProgress.total}) at stages including inter-ministerial consultation, Cabinet approval, and regulatory examination.${entry.inProgress.overdue > 0 ? ` Of these, ${entry.inProgress.overdue} are overdue.` : ""}`);
  }
  if (entry.yetToInitiate.total > 0) {
    parts.push(`Yet to Initiate (${entry.yetToInitiate.total}).${entry.yetToInitiate.overdue > 0 ? ` Of these, ${entry.yetToInitiate.overdue} are overdue beyond approved timelines.` : ""}`);
  }
  parts.push(`Overall implementation rate: ${entry.fullyImplemented.percentage}%.`);
  return parts.join(" ");
}

const MinistryInsights = ({ activeFilter }: MinistryInsightsProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const data = getMinistryData(activeFilter).sort((a, b) => b.total - a.total);

  const getKey = (entry: MinistryEntry) => `${entry.ministryId}-${entry.departmentId || "m"}`;

  const selectedEntry = selectedId ? data.find(d => getKey(d) === selectedId) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="card-gov"
    >
      <div className="border-b border-border px-6 py-5">
        <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Ministry / Department Insights
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {data.length} Ministries/Departments — sorted by recommendation count. Click to view summary.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Ministry List */}
        <div className="flex-1 max-h-[500px] overflow-y-auto scrollbar-thin border-r border-border">
          {data.map((entry, idx) => {
            const key = getKey(entry);
            const name = entry.departmentName ? `${entry.departmentName}` : entry.ministryName;
            const subtitle = entry.departmentName ? entry.ministryName : null;
            const isSelected = selectedId === key;

            return (
              <button
                key={`${key}-${idx}`}
                onClick={() => setSelectedId(isSelected ? null : key)}
                className={`w-full flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 text-left transition-colors ${
                  isSelected ? "bg-primary/5" : "hover:bg-secondary/50"
                }`}
              >
                {/* Rank */}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-muted-foreground">
                  {idx + 1}
                </span>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{name}</p>
                  {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
                </div>

                {/* Stats Mini */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex gap-1.5 items-center">
                    {entry.fullyImplemented.count > 0 && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        {entry.fullyImplemented.count}
                      </span>
                    )}
                    {entry.inProgress.total > 0 && (
                      <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        {entry.inProgress.total}
                      </span>
                    )}
                    {entry.yetToInitiate.total > 0 && (
                      <span className="inline-flex items-center rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                        {entry.yetToInitiate.total}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-primary">{entry.total}</span>
                  <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isSelected ? "rotate-90" : ""}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail Panel */}
        <AnimatePresence mode="wait">
          {selectedEntry ? (
            <motion.div
              key={selectedId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full lg:w-[400px] p-5 bg-secondary/20"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {selectedEntry.departmentName || selectedEntry.ministryName}
                  </h3>
                  {selectedEntry.departmentName && (
                    <p className="text-xs text-muted-foreground">{selectedEntry.ministryName}</p>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedId(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center">
                  <p className="text-xl font-bold text-emerald-800">{selectedEntry.fullyImplemented.count}</p>
                  <p className="text-[10px] text-emerald-600 font-medium">Implemented</p>
                </div>
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-center">
                  <p className="text-xl font-bold text-amber-800">{selectedEntry.inProgress.total}</p>
                  <p className="text-[10px] text-amber-600 font-medium">In Progress</p>
                </div>
                <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 text-center">
                  <p className="text-xl font-bold text-orange-800">{selectedEntry.yetToInitiate.total}</p>
                  <p className="text-[10px] text-orange-600 font-medium">Yet to Initiate</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex h-3 w-full rounded-full overflow-hidden bg-border">
                  {selectedEntry.fullyImplemented.count > 0 && (
                    <div className="bg-emerald-500 transition-all" style={{ width: `${selectedEntry.fullyImplemented.percentage}%` }} />
                  )}
                  {selectedEntry.inProgress.total > 0 && (
                    <div className="bg-amber-500 transition-all" style={{ width: `${selectedEntry.inProgress.percentage}%` }} />
                  )}
                  {selectedEntry.yetToInitiate.total > 0 && (
                    <div className="bg-orange-400 transition-all" style={{ width: `${selectedEntry.yetToInitiate.percentage}%` }} />
                  )}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">{selectedEntry.fullyImplemented.percentage}% done</span>
                  <span className="text-[10px] text-muted-foreground">{selectedEntry.total} total</span>
                </div>
              </div>

              {/* Summary */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                {generateMinistrySummary(selectedEntry)}
              </p>
            </motion.div>
          ) : (
            <div className="hidden lg:flex w-[400px] items-center justify-center p-10 text-center">
              <div>
                <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Select a Ministry or Department to view detailed insights</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MinistryInsights;
