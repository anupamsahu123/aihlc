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
          className="mb-4 text-sm leading-relaxed text-muted-foreground last:mb-0"
          dangerouslySetInnerHTML={{ __html: rendered }}
        />
      );
    });
  };

  const lines = executiveSummary.split("\n\n");
  const preview = lines.slice(0, 2).join("\n\n");
  const hasMore = lines.length > 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="card-gov overflow-hidden"
    >
      <div className="border-b border-border bg-gradient-to-r from-gov-blue-muted to-card px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Executive Summary</h2>
              <p className="text-sm text-muted-foreground">AI-generated portfolio overview</p>
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

      <div className="px-6 py-5">
        <AnimatePresence mode="wait">
          <motion.div key={expanded ? "full" : "preview"}>
            {renderMarkdown(expanded ? executiveSummary : preview)}
          </motion.div>
        </AnimatePresence>

        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary hover:text-gov-blue-light transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {expanded ? "Show less" : "Read full summary"}
          </button>
        )}

        <div className="mt-5 flex items-center gap-2 rounded-lg bg-secondary px-4 py-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">
            AI-generated interpretation as of 12 March 2026. Verify with source records.
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ExecutiveSummary;
