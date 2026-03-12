import { useState } from "react";
import { Search, Filter, ChevronRight, AlertTriangle, CheckCircle2, Clock, Hourglass, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { recommendations } from "@/data/hlcMockData";
import { motion } from "framer-motion";
import type { Recommendation, ImplementationStatus } from "@/data/hlcTypes";

interface RecommendationSearchProps {
  onSelectRec: (rec: Recommendation) => void;
}

const statusIcon = (status: ImplementationStatus) => {
  switch (status) {
    case "Fully implemented": return <CheckCircle2 className="h-4 w-4 text-gov-green" />;
    case "Partially implemented": return <CheckCircle2 className="h-4 w-4 text-gov-teal" />;
    case "Under progress": return <Clock className="h-4 w-4 text-gov-amber" />;
    case "Yet to initiate": return <Hourglass className="h-4 w-4 text-gov-orange" />;
    case "No action": return <XCircle className="h-4 w-4 text-gov-red" />;
  }
};

const statusBadge = (status: ImplementationStatus) => {
  const cls: Record<string, string> = {
    "Fully implemented": "bg-gov-green-light text-gov-green",
    "Partially implemented": "bg-gov-teal-light text-gov-teal",
    "Under progress": "bg-gov-amber-light text-gov-amber",
    "Yet to initiate": "bg-gov-orange-light text-gov-orange",
    "No action": "bg-gov-red-light text-gov-red",
  };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls[status]}`}>{status}</span>;
};

const RecommendationSearch = ({ onSelectRec }: RecommendationSearchProps) => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ImplementationStatus | "All">("All");

  const filtered = recommendations.filter(r => {
    const matchesQuery = !query || 
      r.serialNo.toLowerCase().includes(query.toLowerCase()) ||
      r.description.toLowerCase().includes(query.toLowerCase()) ||
      r.primaryMinistry.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "All" || r.implementationStatus === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const statuses: (ImplementationStatus | "All")[] = ["All", "Fully implemented", "Under progress", "Yet to initiate", "No action"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="card-gov"
    >
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <Search className="h-5 w-5 text-gov-blue" />
          Recommendation Intelligence
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">Search and explore recommendations with AI-powered detail view</p>
      </div>

      <div className="px-6 py-3 border-b border-border">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID, description, or ministry..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Search className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No recommendations found</p>
            <p className="text-xs">Try adjusting your search or filters</p>
          </div>
        ) : (
          filtered.map((rec) => (
            <button
              key={rec.id}
              onClick={() => onSelectRec(rec)}
              className="w-full flex items-center gap-4 px-6 py-4 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors text-left"
            >
              {statusIcon(rec.implementationStatus)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-primary">{rec.serialNo}</span>
                  {statusBadge(rec.implementationStatus)}
                  {rec.delayDays > 0 && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-gov-red-light px-1.5 py-0.5 text-[10px] font-semibold text-gov-red">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      {rec.delayDays}d overdue
                    </span>
                  )}
                </div>
                <p className="text-xs text-foreground truncate">{rec.description}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{rec.primaryMinistry}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default RecommendationSearch;
