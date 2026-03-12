import { useState } from "react";
import { Upload, FileText, MessageSquare, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const DocumentIntelligence = () => {
  const [uploaded, setUploaded] = useState(false);
  const [docQuery, setDocQuery] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = () => {
    setUploaded(true);
    setMessages([{
      role: "assistant",
      content: "Document 'Non-Financial_Regulatory_Reforms_2.pdf' processed successfully. 51 pages indexed. Found references to 7 reforms across QCO categories including synthetic fibres, plastics, base metals, steel, footwear, and electronics. Ready for questions."
    }]);
  };

  const handleAsk = () => {
    if (!docQuery.trim()) return;
    const q = docQuery;
    setDocQuery("");
    setMessages(prev => [...prev, { role: "user", content: q }]);
    setLoading(true);

    setTimeout(() => {
      const responses: Record<string, string> = {
        default: "Based on the uploaded document and portal data: The HLC-NFRR Report-II contains 7 key reforms focused on Quality Control Orders (QCOs). The report recommends revoking QCOs on synthetic fibres, plastics, polymers, and base metals, and suspending certain steel QCOs pending testing infrastructure readiness. The committee found that among ~790 QCOs introduced, a significant number applies to raw materials and intermediates rather than finished goods, which has introduced additional compliance burden.",
      };
      setMessages(prev => [...prev, { role: "assistant", content: responses.default }]);
      setLoading(false);
    }, 1500);
  };

  const suggestions = [
    "What are the key recommendations in this report?",
    "Which reforms relate to steel products?",
    "What does the report say about QCO impact on MSMEs?",
    "Summarize the executive summary",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.7 }}
      className="card-gov"
    >
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-gov-teal" />
          Document Intelligence
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">Upload regulatory documents and ask questions with AI-powered analysis</p>
      </div>

      <div className="p-6">
        {!uploaded ? (
          <button
            onClick={handleUpload}
            className="w-full rounded-xl border-2 border-dashed border-border p-10 text-center hover:border-primary/40 hover:bg-secondary/30 transition-all"
          >
            <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">Upload Document</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX — Click to simulate upload</p>
          </button>
        ) : (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center gap-3 rounded-lg bg-gov-teal-light/50 p-3 border border-gov-teal/20">
              <FileText className="h-8 w-8 text-gov-teal" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground">Non-Financial_Regulatory_Reforms_2.pdf</p>
                <p className="text-[10px] text-muted-foreground">51 pages • 7 reforms identified • Indexed</p>
              </div>
              <span className="rounded-full bg-gov-green-light px-2 py-0.5 text-[10px] font-semibold text-gov-green">Ready</span>
            </div>

            {/* Chat */}
            <div className="max-h-[300px] overflow-y-auto space-y-3 scrollbar-thin">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-lg px-3 py-2 ${
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}>
                    {msg.role === "assistant" && <Sparkles className="inline h-3 w-3 mr-1 text-gov-blue" />}
                    <span className="text-xs leading-relaxed">{msg.content}</span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-lg bg-secondary px-4 py-2.5">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse-dot" style={{ animationDelay: "0s" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse-dot" style={{ animationDelay: "0.2s" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse-dot" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => { setDocQuery(s); }}
                  className="rounded-md bg-secondary px-2.5 py-1 text-[10px] text-secondary-foreground hover:bg-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={docQuery}
                onChange={(e) => setDocQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                placeholder="Ask about the uploaded document..."
                className="flex-1"
              />
              <Button onClick={handleAsk} size="icon" className="bg-primary text-primary-foreground">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DocumentIntelligence;
