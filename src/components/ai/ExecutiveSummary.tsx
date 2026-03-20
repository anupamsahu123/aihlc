import { useState } from "react";
import { Copy, Download, Sparkles, Check, ChevronDown, X, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { getMinistryData, computeAggregates, type MinistryEntry } from "@/data/ministryData";

interface ExecutiveSummaryProps {
  activeFilter: "All" | "HLC-A" | "HLC-B";
}

function generateExecutiveParagraph(filter: "All" | "HLC-A" | "HLC-B"): string {
  const data = getMinistryData(filter);
  const agg = computeAggregates(data);
  const label = filter === "All" ? "HLC-A and HLC-B (NFRR)" : filter === "HLC-A" ? "HLC-A (Viksit Bharat)" : "HLC-B (NFRR)";
  const ministryCount = agg.ministryCount;
  // Partial implemented not available in API data - derive from total minus others
  const partiallyImplemented = 0; // Not tracked separately in this API data
  const notAccepted = 0;
  const noAction = agg.total - agg.fullyImplemented - agg.inProgress - agg.yetToInitiate;

  return `The ${label} recommendation portfolio comprises ${agg.total} recommendations across ${ministryCount} Ministries/Departments. Of the total, Fully Implemented (${agg.fullyImplemented} recommendations) have been completed through issuance of notifications, amendments to existing rules, operationalisation of schemes, grant of approvals, and issuance of guidelines or office memoranda as recorded in the dataset. Under Progress (${agg.inProgress} recommendations) are at various stages including Cabinet approval processes, EFC appraisal, inter-ministerial consultation, stakeholder consultation, regulatory examination, draft note circulation, evaluation studies, issuance of notifications, or are awaiting final approval from competent authorities as per recorded action taken entries. Yet to Initiate (${agg.yetToInitiate} recommendations) remain under examination, under deliberation, or no further action has been taken as per the recorded data.${noAction > 0 ? ` No Action Done (${noAction} recommendations) have not seen any recorded progress.` : ""} Among the Under Progress recommendations, major pending actions include finalisation of draft Cabinet Notes, completion of inter-ministerial consultations, obtaining EFC clearance, securing regulatory approvals, and completion of stakeholder consultations as recorded in the dataset. A total of ${agg.overdue} recommendations are currently overdue beyond their approved timelines across ${ministryCount} Ministries/Departments covered under the portfolio.`;
}

function generateStatusSummary(status: string, filter: "All" | "HLC-A" | "HLC-B"): string {
  const data = getMinistryData(filter);
  const agg = computeAggregates(data);

  if (status === "Fully Implemented") {
    const topMinistries = data.filter(d => d.fullyImplemented.count > 0).sort((a, b) => b.fullyImplemented.count - a.fullyImplemented.count).slice(0, 3);
    const names = topMinistries.map(m => `${m.departmentName || m.ministryName} (${m.fullyImplemented.count})`).join(", ");
    return `${agg.fullyImplemented} recommendations have been fully implemented through issuance of notifications, amendments, approvals, operationalisation and guidelines. Top contributors: ${names}.`;
  }
  if (status === "Under Progress") {
    const topMinistries = data.filter(d => d.inProgress.total > 0).sort((a, b) => b.inProgress.total - a.inProgress.total).slice(0, 3);
    const names = topMinistries.map(m => `${m.departmentName || m.ministryName} (${m.inProgress.total})`).join(", ");
    const overdueCount = data.reduce((s, e) => s + e.inProgress.overdue, 0);
    return `${agg.inProgress} recommendations are under progress at stages including Cabinet approval, inter-ministerial consultation, regulatory examination, and draft note circulation. Of these, ${overdueCount} are overdue. Key ministries: ${names}.`;
  }
  if (status === "Yet to Initiate") {
    const topMinistries = data.filter(d => d.yetToInitiate.total > 0).sort((a, b) => b.yetToInitiate.total - a.yetToInitiate.total).slice(0, 3);
    const names = topMinistries.map(m => `${m.departmentName || m.ministryName} (${m.yetToInitiate.total})`).join(", ");
    const overdueCount = data.reduce((s, e) => s + e.yetToInitiate.overdue, 0);
    return `${agg.yetToInitiate} recommendations are yet to be initiated. Of these, ${overdueCount} are overdue beyond approved timelines. Highest pending: ${names}.`;
  }
  if (status === "Overdue") {
    return `${agg.overdue} recommendations are overdue beyond their approved timelines across ${agg.ministryCount} Ministries/Departments. These require immediate attention and escalation to the competent authority for expedited action.`;
  }
  return "";
}

function generateMinistrySummary(entry: MinistryEntry): string {
  const name = entry.departmentName ? `${entry.departmentName}, ${entry.ministryName}` : entry.ministryName;
  return `${name} has ${entry.total} recommendations. Fully Implemented (${entry.fullyImplemented.count}), Under Progress (${entry.inProgress.total}), Yet to Initiate (${entry.yetToInitiate.total}). Of the in-progress items, ${entry.inProgress.overdue} are overdue. Of the yet-to-initiate items, ${entry.yetToInitiate.overdue} are overdue. Implementation rate stands at ${entry.fullyImplemented.percentage}%.`;
}

const ExecutiveSummary = ({ activeFilter }: ExecutiveSummaryProps) => {
  const [copied, setCopied] = useState(false);
  const [expandedStatus, setExpandedStatus] = useState<string | null>(null);
  const [selectedMinistry, setSelectedMinistry] = useState<string | null>(null);
  const [showMinistryDropdown, setShowMinistryDropdown] = useState(false);

  const paragraph = generateExecutiveParagraph(activeFilter);
  const data = getMinistryData(activeFilter);
  const agg = computeAggregates(data);

  const handleCopy = () => {
    navigator.clipboard.writeText(paragraph);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusCards = [
    { label: "Fully Implemented", count: agg.fullyImplemented, color: "bg-emerald-50 border-emerald-200 text-emerald-800", dotColor: "bg-emerald-500" },
    { label: "Under Progress", count: agg.inProgress, color: "bg-amber-50 border-amber-200 text-amber-800", dotColor: "bg-amber-500" },
    { label: "Yet to Initiate", count: agg.yetToInitiate, color: "bg-orange-50 border-orange-200 text-orange-800", dotColor: "bg-orange-500" },
    { label: "Overdue", count: agg.overdue, color: "bg-red-50 border-red-200 text-red-800", dotColor: "bg-red-500" },
  ];

  const selectedMinistryEntry = selectedMinistry ? data.find(d => {
    const key = d.departmentName ? `${d.departmentName}, ${d.ministryName}` : d.ministryName;
    return key === selectedMinistry;
  }) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="card-gov overflow-hidden"
    >
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-r from-gov-blue-muted to-card px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Executive Summary</h2>
              <p className="text-sm text-muted-foreground">AI-generated portfolio overview — {activeFilter === "All" ? "All Recommendations" : activeFilter}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="text-sm">
              {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="outline" size="sm" className="text-sm">
              <Download className="mr-1.5 h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Summary Paragraph */}
        <p className="text-sm leading-relaxed text-muted-foreground">{paragraph}</p>

        {/* Status Count Cards - Clickable */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statusCards.map((card) => (
            <button
              key={card.label}
              onClick={() => setExpandedStatus(expandedStatus === card.label ? null : card.label)}
              className={`rounded-xl border p-4 text-left transition-all hover:shadow-md ${card.color} ${expandedStatus === card.label ? "ring-2 ring-primary/30" : ""}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`h-2.5 w-2.5 rounded-full ${card.dotColor}`} />
                <span className="text-xs font-medium opacity-80">{card.label}</span>
              </div>
              <p className="text-2xl font-bold">{card.count}</p>
            </button>
          ))}
        </div>

        {/* Expanded Status Summary */}
        <AnimatePresence mode="wait">
          {expandedStatus && (
            <motion.div
              key={expandedStatus}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-border bg-secondary/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-foreground">{expandedStatus} — Summary</h4>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpandedStatus(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {generateStatusSummary(expandedStatus, activeFilter)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ministry/Department Selector */}
        <div className="border-t border-border pt-5">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Ministry / Department Summary</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMinistryDropdown(!showMinistryDropdown)}
              className="w-full flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm text-left hover:bg-secondary/50 transition-colors"
            >
              <span className={selectedMinistry ? "text-foreground" : "text-muted-foreground"}>
                {selectedMinistry || "Select a Ministry / Department to view summary"}
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showMinistryDropdown ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showMinistryDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-border bg-card shadow-lg scrollbar-thin"
                >
                  {data.sort((a, b) => b.total - a.total).map((entry, i) => {
                    const name = entry.departmentName ? `${entry.departmentName}, ${entry.ministryName}` : entry.ministryName;
                    return (
                      <button
                        key={`${entry.ministryId}-${entry.departmentId}-${i}`}
                        onClick={() => { setSelectedMinistry(name); setShowMinistryDropdown(false); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-secondary/50 transition-colors border-b border-border last:border-0"
                      >
                        <span className="text-foreground truncate pr-3">{name}</span>
                        <span className="text-xs font-semibold text-primary shrink-0">{entry.total} recs</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ministry Summary */}
          <AnimatePresence mode="wait">
            {selectedMinistryEntry && (
              <motion.div
                key={selectedMinistry}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 rounded-xl border border-border bg-secondary/40 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-foreground truncate pr-4">{selectedMinistry}</h4>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setSelectedMinistry(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {generateMinistrySummary(selectedMinistryEntry)}
                </p>
                <div className="flex gap-3 mt-3">
                  <div className="flex-1 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-emerald-800">{selectedMinistryEntry.fullyImplemented.count}</p>
                    <p className="text-[10px] text-emerald-600 font-medium">Implemented</p>
                  </div>
                  <div className="flex-1 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-amber-800">{selectedMinistryEntry.inProgress.total}</p>
                    <p className="text-[10px] text-amber-600 font-medium">In Progress</p>
                  </div>
                  <div className="flex-1 rounded-lg bg-orange-50 border border-orange-200 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-orange-800">{selectedMinistryEntry.yetToInitiate.total}</p>
                    <p className="text-[10px] text-orange-600 font-medium">Yet to Initiate</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Disclaimer */}
        <div className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">
            AI-generated interpretation as of 20 March 2026. Computed strictly from structured dataset. Verify with source records.
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ExecutiveSummary;
