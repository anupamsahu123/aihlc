import { useState } from "react";
import { ArrowUpDown, Sparkles, Building2 } from "lucide-react";
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
    const cls = risk === "High" ? "bg-gov-red-light text-gov-red" : risk === "Medium" ? "bg-gov-amber-light text-gov-amber" : "bg-gov-green-light text-gov-green";
    return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>{risk}</span>;
  };

  const SortHeader = ({ label, field }: { label: string; field: keyof MinistryPerformance }) => (
    <th
      onClick={() => toggleSort(field)}
      className="cursor-pointer px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors whitespace-nowrap"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-3 w-3" />
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
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <Building2 className="h-5 w-5 text-gov-indigo" />
          Ministry Performance Matrix
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">Sortable analytics with AI remarks per ministry</p>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Ministry</th>
              <SortHeader label="Total" field="total" />
              <SortHeader label="Implemented" field="fullyImplemented" />
              <SortHeader label="Partial" field="partiallyImplemented" />
              <SortHeader label="Progress" field="underProgress" />
              <SortHeader label="Not Started" field="yetToInitiate" />
              <SortHeader label="Overdue" field="overdueCount" />
              <SortHeader label="Avg Delay" field="avgDelay" />
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Risk</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[220px]">AI Remark</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m, i) => (
              <tr key={m.ministry} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-3 py-3 text-xs font-medium text-foreground max-w-[200px]">{m.ministry}</td>
                <td className="px-3 py-3 text-xs font-semibold text-foreground">{m.total}</td>
                <td className="px-3 py-3 text-xs text-gov-green font-semibold">{m.fullyImplemented}</td>
                <td className="px-3 py-3 text-xs text-gov-teal font-semibold">{m.partiallyImplemented}</td>
                <td className="px-3 py-3 text-xs text-gov-amber font-semibold">{m.underProgress}</td>
                <td className="px-3 py-3 text-xs text-gov-orange font-semibold">{m.yetToInitiate + m.noAction}</td>
                <td className="px-3 py-3 text-xs text-gov-red font-semibold">{m.overdueCount}</td>
                <td className="px-3 py-3 text-xs text-foreground">{m.avgDelay}d</td>
                <td className="px-3 py-3">{riskBadge(m.riskRating)}</td>
                <td className="px-3 py-3">
                  <div className="flex items-start gap-1">
                    <Sparkles className="h-3 w-3 mt-0.5 text-gov-blue shrink-0" />
                    <span className="text-[11px] text-muted-foreground leading-tight">{m.aiRemark}</span>
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
