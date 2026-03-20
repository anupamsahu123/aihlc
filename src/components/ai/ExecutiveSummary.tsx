import { useState } from "react";
import { Copy, Download, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { getMinistryData, computeAggregates } from "@/data/ministryData";

interface ExecutiveSummaryProps {
  activeFilter: "All" | "HLC-A" | "HLC-B";
}

function generateExecutiveParagraph(filter: "All" | "HLC-A" | "HLC-B"): string {
  const data = getMinistryData(filter);
  const agg = computeAggregates(data);
  const label = filter === "All" ? "HLC-A and HLC-B (NFRR)" : filter === "HLC-A" ? "HLC-A (Viksit Bharat)" : "HLC-B (NFRR)";
  const ministryCount = agg.ministryCount;
  const noAction = agg.total - agg.fullyImplemented - agg.inProgress - agg.yetToInitiate;

  return `The ${label} recommendation portfolio comprises ${agg.total} recommendations across ${ministryCount} Ministries/Departments. Of the total, Fully Implemented (${agg.fullyImplemented} recommendations) have been completed through issuance of notifications, amendments to existing rules, operationalisation of schemes, grant of approvals, and issuance of guidelines or office memoranda as recorded in the dataset. Under Progress (${agg.inProgress} recommendations) are at various stages including Cabinet approval processes, EFC appraisal, inter-ministerial consultation, stakeholder consultation, regulatory examination, draft note circulation, evaluation studies, issuance of notifications, or are awaiting final approval from competent authorities as per recorded action taken entries. Yet to Initiate (${agg.yetToInitiate} recommendations) remain under examination, under deliberation, or no further action has been taken as per the recorded data.${noAction > 0 ? ` No Action Done (${noAction} recommendations) have not seen any recorded progress.` : ""} Among the Under Progress recommendations, major pending actions include finalisation of draft Cabinet Notes, completion of inter-ministerial consultations, obtaining EFC clearance, securing regulatory approvals, and completion of stakeholder consultations as recorded in the dataset. A total of ${agg.overdue} recommendations are currently overdue beyond their approved timelines across ${ministryCount} Ministries/Departments covered under the portfolio.`;
}

const ExecutiveSummary = ({ activeFilter }: ExecutiveSummaryProps) => {
  const [copied, setCopied] = useState(false);
  const paragraph = generateExecutiveParagraph(activeFilter);

  const handleCopy = () => {
    navigator.clipboard.writeText(paragraph);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

      <div className="px-6 py-5 space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{paragraph}</p>

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
