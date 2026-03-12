import { recommendations, computeMinistryPerformance } from "@/data/hlcMockData";
import { motion } from "framer-motion";
import { Grid3X3 } from "lucide-react";

const MinistryHeatmap = () => {
  const data = computeMinistryPerformance(recommendations);

  const stages = [
    { key: "yetToInitiate" as const, label: "Yet to Initiate", color: "bg-gov-orange" },
    { key: "underProgress" as const, label: "Under Progress", color: "bg-gov-amber" },
    { key: "partiallyImplemented" as const, label: "Partial", color: "bg-gov-teal" },
    { key: "fullyImplemented" as const, label: "Implemented", color: "bg-gov-green" },
    { key: "pendingWithDirector" as const, label: "With Director", color: "bg-gov-blue" },
    { key: "pendingWithApprover" as const, label: "With Approver", color: "bg-gov-purple" },
    { key: "pendingWithNITI" as const, label: "With NITI", color: "bg-gov-indigo" },
  ];

  const maxVal = Math.max(...data.flatMap(d => stages.map(s => d[s.key])));

  const getOpacity = (val: number) => {
    if (val === 0) return "opacity-10";
    if (maxVal === 0) return "opacity-20";
    const ratio = val / maxVal;
    if (ratio > 0.7) return "opacity-100";
    if (ratio > 0.4) return "opacity-70";
    if (ratio > 0.1) return "opacity-40";
    return "opacity-20";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.45 }}
      className="card-gov"
    >
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <Grid3X3 className="h-5 w-5 text-gov-teal" />
          Ministry Stage Heatmap
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">Visual distribution of recommendations across workflow stages</p>
      </div>

      <div className="overflow-x-auto scrollbar-thin p-6">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr>
              <th className="pb-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-[200px]">Ministry</th>
              {stages.map(s => (
                <th key={s.key} className="pb-3 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((ministry, i) => (
              <tr key={ministry.ministry} className="border-t border-border">
                <td className="py-3 pr-4 text-[11px] font-medium text-foreground">{ministry.ministry.replace("Ministry of ", "")}</td>
                {stages.map(s => (
                  <td key={s.key} className="py-3 text-center">
                    <div className="flex justify-center">
                      <div
                        className={`h-8 w-8 rounded-md flex items-center justify-center text-[10px] font-bold ${s.color} text-primary-foreground ${getOpacity(ministry[s.key])}`}
                        title={`${ministry.ministry}: ${ministry[s.key]} ${s.label}`}
                      >
                        {ministry[s.key]}
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default MinistryHeatmap;
