import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Download, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { executiveSummary } from "@/data/hlcMockData";
import { motion, AnimatePresence } from "framer-motion";

const ExecutiveSummary = () => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(executiveSummary.replace(/\*\*/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderMarkdown = (text: string) => {
    return text.split("\n\n").map((paragraph, i) => {
      const rendered = paragraph.replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="text-foreground">$1</strong>'
      );
      return (
        <p
          key={i}
          className="mb-3 text-sm leading-relaxed text-muted-foreground last:mb-0"
          dangerouslySetInnerHTML={{ __html: rendered }}
        />
      );
    });
  };

  const lines = executiveSummary.split("\n\n");
  const preview = lines.slice(0, 3).join("\n\n");
  const hasMore = lines.length > 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="card-gov overflow-hidden"
    >
      <div className="border-b border-border bg-gradient-to-r from-gov-blue-muted to-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">Executive AI Summary</h2>
              <p className="text-xs text-muted-foreground">Portfolio interpretation for reviewing authority</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleCopy} className="text-muted-foreground">
              {copied ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Download className="mr-1 h-3.5 w-3.5" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <AnimatePresence mode="wait">
          <motion.div key={expanded ? "full" : "preview"}>
            {renderMarkdown(expanded ? executiveSummary : preview)}
          </motion.div>
        </AnimatePresence>

        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:text-gov-blue-light transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? "Show less" : "Read full summary"}
          </button>
        )}

        <div className="mt-4 flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5">
          <Sparkles className="h-3 w-3 text-gov-blue" />
          <span className="text-[10px] text-muted-foreground">
            AI-generated interpretation based on portal data as of 12 March 2026. Verify with source records.
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ExecutiveSummary;
