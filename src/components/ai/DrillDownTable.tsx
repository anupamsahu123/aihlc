import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Recommendation } from "@/data/hlcTypes";
import { motion, AnimatePresence } from "framer-motion";

interface DrillDownTableProps {
  title: string;
  items: Recommendation[];
  onClose: () => void;
  onSelectRec: (rec: Recommendation) => void;
}

const DrillDownTable = ({ title, items, onClose, onSelectRec }: DrillDownTableProps) => {
  if (items.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="card-gov mt-6"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{items.length} recommendation{items.length !== 1 ? "s" : ""}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-12">S.No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recommendation</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Implementing Ministry</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[200px]">Action Taken</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Delay (Days)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[150px]">Reason for Delay</th>
              </tr>
            </thead>
            <tbody>
              {items.map((rec, idx) => {
                const statusColor =
                  rec.implementationStatus === "Fully implemented" ? "text-gov-green bg-gov-green-light" :
                  rec.implementationStatus === "Under progress" || rec.implementationStatus === "Partially implemented" ? "text-gov-amber bg-gov-amber-light" :
                  rec.implementationStatus === "Yet to initiate" ? "text-gov-orange bg-gov-orange-light" :
                  "text-destructive bg-gov-red-light";

                return (
                  <tr
                    key={rec.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => onSelectRec(rec)}
                  >
                    <td className="px-4 py-3 text-sm text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-primary">{rec.serialNo}</span>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{rec.description}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{rec.implementingMinistry}</td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{rec.timeline}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor}`}>
                        {rec.implementationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {rec.detailsOfActionTaken || "No action taken"}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-center">
                      {rec.delayDays > 0 ? (
                        <span className="text-destructive">{rec.delayDays}</span>
                      ) : (
                        <span className="text-gov-green">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {rec.reasonIfNotImplemented || (rec.delayDays > 0 ? "Administrative / procedural delays" : "—")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DrillDownTable;
