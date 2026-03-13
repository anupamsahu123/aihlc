import { Sparkles, X, Clock, Building2, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recommendations, aiSummaryForRec } from "@/data/hlcMockData";
import type { Recommendation } from "@/data/hlcTypes";
import { motion } from "framer-motion";

interface AISearchResponseProps {
  query: string;
  onClose: () => void;
  onSelectRec: (rec: Recommendation) => void;
}

function getImplementationStage(rec: Recommendation): string {
  if (rec.implementationStatus === "Fully implemented") return "Completed";
  if (rec.implementationStatus === "Yet to initiate" || rec.implementationStatus === "No action") return "Initial Stage";
  
  // Determine stage based on updates and progress indicators
  const actionText = rec.detailsOfActionTaken.toLowerCase();
  if (actionText.includes("amendment") && (actionText.includes("issued") || actionText.includes("notif"))) return "Final Stage before Completion";
  if (actionText.includes("draft") || actionText.includes("consultation") || actionText.includes("circulated")) return "Mid Stage";
  if (rec.updates.length <= 1) return "Initial Stage";
  return "Mid Stage";
}

function getProgressPercent(rec: Recommendation): number {
  if (rec.implementationStatus === "Fully implemented") return 100;
  if (rec.implementationStatus === "No action" || rec.implementationStatus === "Yet to initiate") return 0;
  const stage = getImplementationStage(rec);
  if (stage === "Final Stage before Completion") return 85;
  if (stage === "Mid Stage") return 55;
  return 20;
}

function findRecommendation(query: string): Recommendation | null {
  // Try to find recommendation ID in query
  const patterns = [
    /([AB]-[IV]+\/[\d.]+(?:\[.*?\])?)/i,
    /([AB]-[IV]+\/[\d.]+)/i,
  ];
  for (const p of patterns) {
    const match = query.match(p);
    if (match) {
      const id = match[1].toUpperCase();
      return recommendations.find(r => r.serialNo.toUpperCase().includes(id)) || null;
    }
  }
  // Try partial match
  const lower = query.toLowerCase();
  return recommendations.find(r => lower.includes(r.serialNo.toLowerCase())) || null;
}

function generateResponse(query: string): { type: "recommendation" | "list" | "text"; rec?: Recommendation; recs?: Recommendation[]; text: string; title: string } {
  const lower = query.toLowerCase();
  
  // Check for specific recommendation
  const rec = findRecommendation(query);
  if (rec) {
    return { type: "recommendation", rec, text: aiSummaryForRec(rec), title: `Summary of ${rec.serialNo}` };
  }

  // Check for overdue queries
  if (lower.includes("overdue")) {
    const overdueRecs = recommendations.filter(r => r.delayDays > 0);
    const hlcb = lower.includes("hlc-b") || lower.includes("nfrr") || !lower.includes("hlc-a");
    const filtered = hlcb ? overdueRecs.filter(r => r.hlcType === "HLC-B") : overdueRecs;
    return {
      type: "list",
      recs: filtered,
      text: `There are **${filtered.length} overdue recommendations** under ${hlcb ? "HLC-B/NFRR" : "the portfolio"}. The most critical ones are listed below with delay details.`,
      title: "Overdue Recommendations"
    };
  }

  // Check for pending queries
  if (lower.includes("pending") && lower.includes("ministry director")) {
    const pending = recommendations.filter(r => r.currentOwner === "Ministry Director" && r.implementationStatus !== "Fully implemented");
    return { type: "list", recs: pending, text: `**${pending.length} recommendations** are currently pending with Ministry Director.`, title: "Pending with Ministry Director" };
  }
  if (lower.includes("pending") && lower.includes("niti")) {
    const pending = recommendations.filter(r => r.currentOwner === "NITI Approver" && r.implementationStatus !== "Fully implemented");
    return { type: "list", recs: pending, text: `**${pending.length} recommendations** are currently pending with NITI Approver.`, title: "Pending with NITI Approver" };
  }
  if (lower.includes("pending") && (lower.includes("ministry approver") || lower.includes("approver"))) {
    const pending = recommendations.filter(r => r.currentOwner === "Ministry Approver" && r.implementationStatus !== "Fully implemented");
    return { type: "list", recs: pending, text: `**${pending.length} recommendations** are currently pending with Ministry Approver.`, title: "Pending with Ministry Approver" };
  }

  // Check for fully implemented
  if (lower.includes("fully implemented") || lower.includes("implemented") || lower.includes("completed")) {
    const impl = recommendations.filter(r => r.implementationStatus === "Fully implemented");
    return { type: "list", recs: impl, text: `**${impl.length} recommendations** have been fully implemented with documentary closure.`, title: "Fully Implemented Recommendations" };
  }

  // Check for delay status
  if (lower.includes("delay")) {
    const rec2 = findRecommendation(query);
    if (rec2) {
      const delayText = rec2.delayDays > 0
        ? `Recommendation ${rec2.serialNo} is delayed by **${rec2.delayDays} days** beyond the approved timeline. ${rec2.reasonIfNotImplemented || "Delay is due to administrative and procedural processes."}`
        : `Recommendation ${rec2.serialNo} is **not delayed**. It is within the approved timeline of ${rec2.timeline}.`;
      return { type: "text", text: delayText, title: `Delay Status: ${rec2.serialNo}` };
    }
  }

  // Check for ministry-specific queries
  const ministryKeywords = [
    { key: "mca", name: "Ministry of Corporate Affairs" },
    { key: "corporate affairs", name: "Ministry of Corporate Affairs" },
    { key: "msme", name: "Ministry of Micro, Small and Medium Enterprises" },
    { key: "environment", name: "Ministry of Environment, Forest and Climate Change" },
    { key: "commerce", name: "Ministry of Commerce and Industry / DPIIT" },
    { key: "steel", name: "Ministry of Steel" },
    { key: "textiles", name: "Ministry of Textiles" },
    { key: "chemicals", name: "Ministry of Chemicals and Fertilizers" },
  ];
  for (const mk of ministryKeywords) {
    if (lower.includes(mk.key)) {
      const ministryRecs = recommendations.filter(r => r.primaryMinistry === mk.name || r.implementingMinistry === mk.name);
      const impl = ministryRecs.filter(r => r.implementationStatus === "Fully implemented").length;
      const overdue = ministryRecs.filter(r => r.delayDays > 0).length;
      return {
        type: "list",
        recs: ministryRecs,
        text: `**${mk.name}** has **${ministryRecs.length} recommendations** — ${impl} fully implemented, ${overdue} overdue.`,
        title: `${mk.name} – Summary`
      };
    }
  }

  // Check for high risk
  if (lower.includes("high risk") || lower.includes("risk")) {
    const highRisk = recommendations.filter(r => r.riskLevel === "High");
    return { type: "list", recs: highRisk, text: `There are **${highRisk.length} high-risk recommendations** requiring immediate attention.`, title: "High Risk Recommendations" };
  }

  // Default: general summary
  const total = recommendations.length;
  const impl = recommendations.filter(r => r.implementationStatus === "Fully implemented").length;
  const overdue = recommendations.filter(r => r.delayDays > 0).length;
  return {
    type: "text",
    text: `The HLC-B portfolio has **${total} recommendations** across 7 ministries. **${impl} (${Math.round(impl/total*100)}%)** are fully implemented, **${overdue}** are overdue. Use specific queries like "summary of B-I/4.10.2" or "which recommendations are overdue?" for detailed insights.`,
    title: "Portfolio Summary"
  };
}

const AISearchResponse = ({ query, onClose, onSelectRec }: AISearchResponseProps) => {
  const response = generateResponse(query);

  const statusBadge = (status: string) => {
    const cls = status === "Fully implemented" ? "bg-gov-green-light text-gov-green" :
      status === "Under progress" || status === "Partially implemented" ? "bg-gov-amber-light text-gov-amber" :
      status === "Yet to initiate" ? "bg-gov-orange-light text-gov-orange" :
      "bg-gov-red-light text-destructive";
    return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{status}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-gov mb-6"
    >
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold text-foreground">{response.title}</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-6">
        {/* AI Text Response */}
        <div className="bg-secondary/50 rounded-xl p-5 mb-5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="text-sm text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: response.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </div>
        </div>

        {/* Recommendation Detail Card */}
        {response.type === "recommendation" && response.rec && (
          <div className="border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-display text-xl font-bold text-primary">{response.rec.serialNo}</span>
              {statusBadge(response.rec.implementationStatus)}
            </div>

            <p className="text-sm text-foreground">{response.rec.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Implementing Ministry</p>
                <p className="font-medium text-foreground flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-primary" />{response.rec.implementingMinistry}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Timeline</p>
                <p className="font-medium text-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-gov-amber" />{response.rec.timeline}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Currently With</p>
                <p className="font-medium text-foreground">{response.rec.currentOwner}</p>
              </div>
            </div>

            {/* Implementation Stage (for non-completed) */}
            {response.rec.implementationStatus !== "Fully implemented" && (
              <div className="bg-gov-amber-light/30 rounded-lg p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Implementation Progress</p>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-bold text-foreground">{getImplementationStage(response.rec)}</span>
                  <span className="text-sm font-bold text-gov-amber">{getProgressPercent(response.rec)}%</span>
                </div>
                <div className="w-full bg-border rounded-full h-2.5">
                  <div className="bg-gov-amber rounded-full h-2.5 transition-all" style={{ width: `${getProgressPercent(response.rec)}%` }} />
                </div>
              </div>
            )}

            {response.rec.delayDays > 0 && (
              <div className="flex items-center gap-2 text-sm bg-gov-red-light/40 rounded-lg px-4 py-3">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-destructive font-semibold">Delayed by {response.rec.delayDays} days</span>
                {response.rec.reasonIfNotImplemented && (
                  <span className="text-muted-foreground ml-1">— {response.rec.reasonIfNotImplemented}</span>
                )}
              </div>
            )}

            {response.rec.implementationStatus === "Fully implemented" && (
              <div className="flex items-center gap-2 text-sm bg-gov-green-light/40 rounded-lg px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-gov-green" />
                <span className="text-gov-green font-semibold">Fully implemented — documentary closure complete</span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectRec(response.rec!)}
              className="mt-2"
            >
              View Full Details <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* List of Recommendations */}
        {response.type === "list" && response.recs && response.recs.length > 0 && (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">S.No.</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Recommendation</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Ministry</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Delay</th>
                </tr>
              </thead>
              <tbody>
                {response.recs.map((r, i) => (
                  <tr
                    key={r.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 cursor-pointer transition-colors"
                    onClick={() => onSelectRec(r)}
                  >
                    <td className="px-3 py-2.5 text-sm text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-sm font-bold text-primary">{r.serialNo}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.description.substring(0, 60)}...</p>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-foreground">{r.primaryMinistry}</td>
                    <td className="px-3 py-2.5">{statusBadge(r.implementationStatus)}</td>
                    <td className="px-3 py-2.5 text-sm font-bold">
                      {r.delayDays > 0 ? <span className="text-destructive">{r.delayDays}d</span> : <span className="text-gov-green">On time</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="border-t border-border px-6 py-3">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          AI-generated response based on portal data. Click any recommendation for full details.
        </p>
      </div>
    </motion.div>
  );
};

export default AISearchResponse;
