import { useState } from "react";
import { ArrowUpDown, Building2, Sparkles } from "lucide-react";
import { recommendations, computeMinistryPerformance } from "@/data/hlcMockData";
import { motion } from "framer-motion";
import type { MinistryPerformance } from "@/data/hlcTypes";

const MinistryMatrix = () => {
  const data = computeMinistryPerformance(recommendations);
  const [sortKey, setSortKey] = useState<keyof MinistryPerformance>("total");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...data].sort((a, b) => {
    const av = a[sortKey] as number;
    const bv = b[sortKey] as number;
    return sortAsc ? av - bv : bv - av;
  });

  const toggleSort = (key: keyof MinistryPerformance) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const riskBadge = (risk: string) => {
    const cls = risk === "High" ? "bg-gov-red-light text-destructive" : risk === "Medium" ? "bg-gov-amber-light text-gov-amber" : "bg-gov-green-light text-gov-green";
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{risk}</span>;
  };

  const SortHeader = ({ label, field }: { label: string; field: keyof MinistryPerformance }) => (
    <th
      onClick={() => toggleSort(field)}
      className="cursor-pointer px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors whitespace-nowrap"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-3.5 w-3.5" />
      </span>
    </th>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="card-gov"
    >
      <div className="border-b border-border px-6 py-5">
        <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
          <Building2 className="h-5 w-5 text-gov-indigo" />
          Ministry Performance
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Click column headers to sort</p>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ministry</th>
              <SortHeader label="Total" field="total" />
              <SortHeader label="Done" field="fullyImplemented" />
              <SortHeader label="In Progress" field="underProgress" />
              <SortHeader label="Overdue" field="overdueCount" />
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[240px]">AI Remark</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => (
              <tr key={m.ministry} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-4 text-sm font-medium text-foreground max-w-[220px]">{m.ministry}</td>
                <td className="px-4 py-4 text-sm font-bold text-foreground">{m.total}</td>
                <td className="px-4 py-4 text-sm font-bold text-gov-green">{m.fullyImplemented}</td>
                <td className="px-4 py-4 text-sm font-bold text-gov-amber">{m.underProgress + m.partiallyImplemented}</td>
                <td className="px-4 py-4 text-sm font-bold text-destructive">{m.overdueCount}</td>
                <td className="px-4 py-4">{riskBadge(m.riskRating)}</td>
                <td className="px-4 py-4">
                  <div className="flex items-start gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                    <span className="text-xs text-muted-foreground leading-relaxed">{m.aiRemark}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default MinistryMatrix;
