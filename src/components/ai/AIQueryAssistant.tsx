import { useState } from "react";
import { Send, Sparkles, Table, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { suggestedPrompts, recommendations } from "@/data/hlcMockData";
import type { ChatMessage } from "@/data/hlcTypes";

const AIQueryAssistant = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const generateResponse = (q: string): ChatMessage => {
    const lower = q.toLowerCase();

    if (lower.includes("overdue")) {
      const overdue = recommendations.filter(r => r.delayDays > 0);
      return {
        role: "assistant",
        content: `Found **${overdue.length} overdue recommendations**. The most critical are B-I/4.11.2 (132 days), B-I/4.16.2 and B-I/4.17.2 (102 days each), and B-I/4.3.2 (71 days). These require immediate escalation to the Programme Director.`,
        table: {
          headers: ["Rec ID", "Description", "Delay (days)", "Ministry", "Status"],
          rows: overdue.map(r => [r.serialNo, r.description.substring(0, 50) + "...", String(r.delayDays), r.primaryMinistry.substring(0, 30), r.implementationStatus]),
        },
        timestamp: new Date(),
      };
    }

    if (lower.includes("implemented") || lower.includes("fully")) {
      const impl = recommendations.filter(r => r.implementationStatus === "Fully implemented");
      return {
        role: "assistant",
        content: `**${impl.length} recommendations** are fully implemented (${Math.round(impl.length/recommendations.length*100)}% of portfolio). These include perpetual CTO validity (B-I/4.10.2), Small Company definition revision (B-I/4.1.2), and MSEFC strengthening (B-I/4.15.2). All have documentary closure evidence.`,
        timestamp: new Date(),
      };
    }

    if (lower.includes("mca") || lower.includes("corporate affairs")) {
      const mca = recommendations.filter(r => r.primaryMinistry.includes("Corporate Affairs"));
      return {
        role: "assistant",
        content: `**Ministry of Corporate Affairs** has **${mca.length} recommendations**: ${mca.filter(r => r.implementationStatus === "Fully implemented").length} fully implemented, ${mca.filter(r => r.implementationStatus === "Under progress").length} under progress. The MCA has shown strong rule amendment capability (Companies Act definition changes completed quickly), but Act-level amendments depend on parliamentary calendar. The Amendment Bill for CA-2013 is ready and covers CSR exemption and board meeting simplification.`,
        timestamp: new Date(),
      };
    }

    if (lower.includes("ministry director") || lower.includes("pending with")) {
      const pending = recommendations.filter(r => r.currentOwner === "Ministry Director" && r.implementationStatus !== "Fully implemented");
      return {
        role: "assistant",
        content: `**${pending.length} recommendations** are currently pending with Ministry Director. These span across multiple ministries and include high-priority items like CGTMSE expansion (B-I/4.16.2) and FDI clarification (B-I/4.11.2).`,
        table: {
          headers: ["Rec ID", "Ministry", "Status", "Delay"],
          rows: pending.map(r => [r.serialNo, r.primaryMinistry.substring(0, 35), r.implementationStatus, r.delayDays > 0 ? `${r.delayDays}d` : "On track"]),
        },
        timestamp: new Date(),
      };
    }

    return {
      role: "assistant",
      content: `Based on the HLC-B portfolio analysis: The portfolio contains 16 recommendations across 7 ministries. Currently, 25% are fully implemented, 43.75% are under progress, and 18.75% are yet to initiate. Key areas needing attention include MSME-related reforms (bundled in Amendment Bill), QCO revocations (Report-II), and FDI policy clarification. Would you like me to drill down into a specific area?`,
      timestamp: new Date(),
    };
  };

  const handleSend = () => {
    if (!query.trim()) return;
    const q = query;
    setQuery("");
    setMessages(prev => [...prev, { role: "user", content: q, timestamp: new Date() }]);
    setLoading(true);

    setTimeout(() => {
      setMessages(prev => [...prev, generateResponse(q)]);
      setLoading(false);
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.8 }}
      className="card-gov"
    >
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          AI Query Assistant
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">Ask questions about recommendations, ministries, timelines, and workflows</p>
      </div>

      <div className="p-6">
        {/* Messages */}
        <div className="max-h-[400px] min-h-[200px] overflow-y-auto mb-4 space-y-4 scrollbar-thin">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Sparkles className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm font-medium">Ask anything about the HLC portfolio</p>
              <p className="text-xs mt-1">Natural language queries supported</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[90%] rounded-lg px-4 py-3 ${
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}>
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-1 mb-1.5">
                    <Sparkles className="h-3 w-3 text-gov-blue" />
                    <span className="text-[10px] font-semibold text-gov-blue">AI Response</span>
                  </div>
                )}
                <p className="text-xs leading-relaxed" dangerouslySetInnerHTML={{
                  __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }} />

                {msg.table && (
                  <div className="mt-3 overflow-x-auto rounded-md border border-border bg-card">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="border-b border-border bg-muted">
                          {msg.table.headers.map(h => (
                            <th key={h} className="px-2 py-1.5 text-left font-semibold text-foreground whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {msg.table.rows.map((row, ri) => (
                          <tr key={ri} className="border-b border-border last:border-0">
                            {row.map((cell, ci) => (
                              <td key={ci} className="px-2 py-1.5 text-muted-foreground whitespace-nowrap">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-secondary px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-gov-blue" />
                  <span className="text-[10px] text-muted-foreground">Analyzing portfolio data</span>
                  <div className="flex gap-1 ml-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse-dot" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse-dot" style={{ animationDelay: "0.2s" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse-dot" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {suggestedPrompts.slice(0, 5).map(p => (
            <button
              key={p}
              onClick={() => setQuery(p)}
              className="rounded-md bg-secondary px-2.5 py-1 text-[10px] text-secondary-foreground hover:bg-accent transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask: 'Which recommendations are overdue?' or 'Summarize MCA performance'"
            className="flex-1"
          />
          <Button onClick={handleSend} className="bg-primary text-primary-foreground">
            <Send className="h-4 w-4 mr-1" />
            Ask
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AIQueryAssistant;
