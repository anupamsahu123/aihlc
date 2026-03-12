import { useState, useRef } from "react";
import { Upload, FileText, MessageSquare, Sparkles, Send, X, Download, FileSearch, AlertCircle, CheckCircle2, Loader2, Plus, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { recommendations } from "@/data/hlcMockData";
import type { Recommendation } from "@/data/hlcTypes";

interface UploadedFile {
  name: string;
  pages: number;
  type: "nfrr" | "other";
  reforms: string[];
}

interface ReportRow {
  sNo: string;
  recommendation: string;
  implementingMinistry: string;
  actsRules: string;
  otherMinistries: string;
  timeline: string;
  status: string;
  detailsOfAction: string;
  delayDays: string;
  reasonForDelay: string;
  timelineForCompletion: string;
}

// Map NFRR document reform references to DB serial numbers
function mapNFRRToDBSerial(nfrrRef: string): string | null {
  // NFRR Report II, Reform 5.1 → B-II/5.1
  // HLC-B Report I, 4.10.2 → B-I/4.10.2
  const patterns = [
    { regex: /(?:NFRR|HLC[\s-]?B)\s*(?:Report\s*)?(I{1,3}|[1-3])\s*[,./]\s*(\d+(?:\.\d+)*(?:\[.*?\])?)/i, prefix: "B" },
    { regex: /(?:Viksit\s*Bharat|HLC[\s-]?A)\s*(?:Report\s*)?(I{1,3}|[1-3])\s*[,./]\s*(\d+(?:\.\d+)*(?:\[.*?\])?)/i, prefix: "A" },
  ];

  for (const { regex, prefix } of patterns) {
    const match = nfrrRef.match(regex);
    if (match) {
      const romanMap: Record<string, string> = { "1": "I", "2": "II", "3": "III", "I": "I", "II": "II", "III": "III" };
      const report = romanMap[match[1]] || match[1];
      return `${prefix}-${report}/${match[2]}`;
    }
  }
  return null;
}

// Mock NFRR document data (simulates content from the uploaded Non-Financial_Regulatory_Reforms_2.pdf)
const nfrrDocumentData: Record<string, { background: string; justification: string; roadmap: string; recommendations: string }> = {
  "B-II/5.1": {
    background: "India's quality-control framework has seen substantial expansion. QCOs on synthetic fibres have introduced compliance burden on textile manufacturers.",
    justification: "Health/Safety Risk: Synthetic fibres are industrial intermediates. Non-conformity does not directly endanger consumer health. Domestic capacity for advanced synthetic fibres remains limited.",
    roadmap: "Revoke QCOs on synthetic fibres, yarns and inputs. Action: Ministry of Textiles. Timeline: November 15, 2025.",
    recommendations: "Revoke Quality Control Orders on synthetic fibres, yarns and inputs to reduce compliance burden on manufacturers.",
  },
  "B-II/5.2": {
    background: "Among ~790 QCOs introduced, a significant number applies to raw materials including plastics and polymers, introducing additional compliance requirements.",
    justification: "International practice generally focuses mandatory certification on end-use products. QCOs on plastics/polymers have introduced operational complexities for downstream industries.",
    roadmap: "Revoke QCOs on plastics and polymers. Action: Department of Chemicals and Petrochemicals. Timeline: November 15, 2025.",
    recommendations: "Revoke Quality Control Orders on plastics and polymers to ease regulatory burden on manufacturers.",
  },
  "B-II/5.4": {
    background: "Steel is a critical input across diverse industries. QCOs on certain steel categories have been implemented without adequate testing infrastructure.",
    justification: "BIS testing lab readiness assessment shows inadequacy in 7 identified categories. Global benchmarking shows no major economy mandates factory-level certification for general steel products.",
    roadmap: "Suspend implementation of QCOs in identified steel product categories. Action: Ministry of Steel. Timeline: November 15, 2025.",
    recommendations: "Suspend implementation of Quality Control Orders in certain Steel product categories where testing infrastructure is inadequate.",
  },
  "B-II/5.5": {
    background: "SIMS was instituted in September 2019. The NOC process requires TC approval for each consignment of non-BIS steel, causing delays of 4-6 weeks.",
    justification: "Duplication of DGFT monitoring role. Procedural delays causing demurrage costs. MSMEs face hardship with repetitive NOCs for recurring orders.",
    roadmap: "Revoke SIMS notification and NOC requirement. Action: Ministry of Steel, DGFT. Timeline: November 15, 2025.",
    recommendations: "Revoke Steel Import Monitoring System and the NOC process for import of non-QCO grades of steel.",
  },
  "B-II/5.7": {
    background: "Over 79 new QCOs are under implementation across multiple ministries covering raw materials, intermediate goods, and capital equipment.",
    justification: "Over-extension of scope to generic industrial inputs. Testing infrastructure already stretched. Trade competitiveness impact on capital goods access.",
    roadmap: "Defer implementation and refer to IMG for review. Action: DPIIT. Timeline: November 15, 2025.",
    recommendations: "Defer implementation and refer to Inter-Ministerial Group (IMG) for review of all upcoming QCOs in RM, Intermediate Goods and Capital Goods.",
  },
};

function generateReportRows(dbRecs: Recommendation[], nfrrData: Record<string, typeof nfrrDocumentData[string]>): ReportRow[] {
  return dbRecs.map((rec) => {
    const nfrr = nfrrData[rec.serialNo];
    return {
      sNo: rec.serialNo,
      recommendation: rec.recommendationText,
      implementingMinistry: rec.implementingMinistry,
      actsRules: nfrr?.justification ? nfrr.justification.substring(0, 120) + "..." : "—",
      otherMinistries: rec.otherImplementingMinistries?.join(", ") || "—",
      timeline: rec.timeline,
      status: rec.implementationStatus,
      detailsOfAction: rec.detailsOfActionTaken || "No action taken",
      delayDays: rec.delayDays > 0 ? `${rec.delayDays} days` : "On track",
      reasonForDelay: rec.reasonIfNotImplemented || (rec.delayDays > 0 ? "Under progress / consultation" : "—"),
      timelineForCompletion: rec.updatedTimeline || rec.timeline,
    };
  });
}

const DocumentIntelligence = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [docQuery, setDocQuery] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string; table?: ReportRow[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportRows, setReportRows] = useState<ReportRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (fileType: "nfrr" | "other") => {
    const newFile: UploadedFile = fileType === "nfrr"
      ? { name: "Non_Financial_Regulatory_Reforms_2.pdf", pages: 51, type: "nfrr", reforms: ["B-II/5.1", "B-II/5.2", "B-II/5.4", "B-II/5.5", "B-II/5.7"] }
      : { name: "HLC_Recommendations_Report.pdf", pages: 132, type: "other", reforms: [] };

    setUploadedFiles(prev => [...prev, newFile]);

    const msg = fileType === "nfrr"
      ? `Document '${newFile.name}' processed successfully. ${newFile.pages} pages indexed. Found references to ${newFile.reforms.length} reforms: ${newFile.reforms.join(", ")}. These will be cross-referenced with the HLC-B (NFRR) recommendations database.`
      : `Document '${newFile.name}' processed. ${newFile.pages} pages indexed. Recommendations data extracted and ready for cross-referencing.`;

    setMessages(prev => [...prev, { role: "assistant", content: msg }]);
  };

  const handleGenerateReport = () => {
    setLoading(true);
    setMessages(prev => [...prev, { role: "user", content: "Generate auto-generated report for HLC-B (NFRR) recommendations" }]);

    setTimeout(() => {
      // Only HLC-B recommendations
      const hlcBRecs = recommendations.filter(r => r.hlcType === "HLC-B");
      const rows = generateReportRows(hlcBRecs, nfrrDocumentData);
      setReportRows(rows);
      setReportGenerated(true);

      const hasNFRR = uploadedFiles.some(f => f.type === "nfrr");
      const summary = hasNFRR
        ? `**Auto-Generated Report — HLC-NFRR Sameeksha Portal**\n\nCross-referenced ${hlcBRecs.length} HLC-B (NFRR) recommendations from the portal database with the uploaded NFRR Report-II document.\n\n• ${hlcBRecs.filter(r => r.implementationStatus === "Fully implemented").length} Fully Implemented\n• ${hlcBRecs.filter(r => r.implementationStatus === "Partially implemented").length} Partially Implemented\n• ${hlcBRecs.filter(r => r.implementationStatus === "Under progress").length} Under Progress\n• ${hlcBRecs.filter(r => r.implementationStatus === "Yet to initiate").length} Yet to Initiate\n• ${hlcBRecs.filter(r => r.implementationStatus === "No action").length} No Action\n\nData enriched with justification, background, and implementation roadmap from the uploaded NFRR document where available. Fields not present in the database (Acts/Rules, justification) were sourced from the uploaded document.`
        : `**Auto-Generated Report — HLC-NFRR Sameeksha Portal**\n\nGenerated report for ${hlcBRecs.length} HLC-B (NFRR) recommendations from the portal database.\n\nUpload the NFRR document to enrich this report with justification, background, and implementation roadmap details not present in the database.`;

      setMessages(prev => [...prev, { role: "assistant", content: summary, table: rows }]);
      setLoading(false);
    }, 2000);
  };

  const handleAsk = () => {
    if (!docQuery.trim()) return;
    const q = docQuery;
    setDocQuery("");
    setMessages(prev => [...prev, { role: "user", content: q }]);
    setLoading(true);

    setTimeout(() => {
      // Try to match a recommendation serial number
      const serialMatch = q.match(/[BA]-(?:I{1,3}|[1-3])\/\d+(?:\.\d+)*(?:\[.*?\])?/i);
      const hasNFRR = uploadedFiles.some(f => f.type === "nfrr");

      let response = "";
      if (serialMatch) {
        const serial = serialMatch[0];
        const rec = recommendations.find(r => r.serialNo.toLowerCase() === serial.toLowerCase());
        const nfrr = nfrrDocumentData[serial];

        if (rec) {
          response = `**${rec.serialNo}** — ${rec.description}\n\n**DB Status:** ${rec.implementationStatus}\n**Ministry:** ${rec.implementingMinistry}\n**Timeline:** ${rec.timeline}\n**Delay:** ${rec.delayDays > 0 ? rec.delayDays + " days" : "On track"}\n**Action Taken:** ${rec.detailsOfActionTaken}`;
          if (nfrr && hasNFRR) {
            response += `\n\n**From NFRR Document:**\n• Background: ${nfrr.background}\n• Justification: ${nfrr.justification}\n• Roadmap: ${nfrr.roadmap}`;
          }
        } else {
          response = `No recommendation found with serial number '${serial}' in the HLC-B database. Note: Only HLC-B (NFRR) recommendations are supported.`;
        }
      } else if (q.toLowerCase().includes("report") || q.toLowerCase().includes("generate")) {
        response = "Use the 'Generate Report' button above to create a comprehensive auto-generated report for all HLC-B (NFRR) recommendations. The report will cross-reference database records with uploaded NFRR document data.";
      } else if (q.toLowerCase().includes("overdue")) {
        const overdue = recommendations.filter(r => r.hlcType === "HLC-B" && r.delayDays > 0);
        response = `**Overdue HLC-B Recommendations (${overdue.length}):**\n\n${overdue.map(r => `• **${r.serialNo}** — ${r.description} (${r.delayDays} days overdue, ${r.implementationStatus})`).join("\n")}`;
      } else {
        response = hasNFRR
          ? "Based on the uploaded documents and portal data: The HLC-NFRR Report-II contains 7 key reforms focused on Quality Control Orders (QCOs). Cross-referencing with the database shows implementation progress across ministries. Use specific recommendation IDs (e.g., B-II/5.1) for detailed insights."
          : "Please upload the NFRR document to enable cross-referencing with database records. You can ask about specific recommendations using their serial numbers (e.g., B-II/5.1).";
      }

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setLoading(false);
    }, 1500);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDownloadReport = () => {
    if (reportRows.length === 0) return;
    const headers = ["S.No.", "Recommendation", "Implementing Ministry", "Acts/Rules/Provisions", "Other Ministries", "Timeline", "Status", "Details of Action Taken", "Delay", "Reason for Delay", "Timeline for Completion"];
    const csvContent = [
      headers.join(","),
      ...reportRows.map(r => [
        `"${r.sNo}"`, `"${r.recommendation}"`, `"${r.implementingMinistry}"`, `"${r.actsRules}"`, `"${r.otherMinistries}"`,
        `"${r.timeline}"`, `"${r.status}"`, `"${r.detailsOfAction}"`, `"${r.delayDays}"`, `"${r.reasonForDelay}"`, `"${r.timelineForCompletion}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "HLC_NFRR_Report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const suggestions = [
    "Show details for B-II/5.1",
    "Which HLC-B recommendations are overdue?",
    "What does the NFRR document say about B-II/5.4?",
    "Generate combined report",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.7 }}
      className="card-gov lg:col-span-2"
    >
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-gov-teal" />
            Document Intelligence & Report Generator
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload NFRR documents, cross-reference with database, and generate combined reports (HLC-B / NFRR only)
          </p>
        </div>
        {reportGenerated && (
          <Button onClick={handleDownloadReport} variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Download CSV
          </Button>
        )}
      </div>

      <div className="p-6 space-y-4">
        {/* Upload Area */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => handleUpload("nfrr")}
            className="flex-1 min-w-[200px] rounded-xl border-2 border-dashed border-gov-teal/30 p-5 text-center hover:border-gov-teal/60 hover:bg-gov-teal-light/20 transition-all group"
          >
            <Upload className="mx-auto h-8 w-8 text-gov-teal/60 mb-2 group-hover:text-gov-teal transition-colors" />
            <p className="text-xs font-semibold text-foreground">Upload NFRR Document</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Non-Financial Regulatory Reforms PDF</p>
          </button>
          <button
            onClick={() => handleUpload("other")}
            className="flex-1 min-w-[200px] rounded-xl border-2 border-dashed border-border p-5 text-center hover:border-primary/40 hover:bg-secondary/30 transition-all group"
          >
            <Plus className="mx-auto h-8 w-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
            <p className="text-xs font-semibold text-foreground">Upload Additional Document</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Recommendations, justification, notes</p>
          </button>
        </div>

        {/* Uploaded Files */}
        <AnimatePresence>
          {uploadedFiles.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
              {uploadedFiles.map((file, i) => (
                <motion.div
                  key={`${file.name}-${i}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  className={`flex items-center gap-3 rounded-lg p-3 border ${
                    file.type === "nfrr" ? "bg-gov-teal-light/30 border-gov-teal/20" : "bg-secondary/50 border-border"
                  }`}
                >
                  <FileText className={`h-6 w-6 ${file.type === "nfrr" ? "text-gov-teal" : "text-primary"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {file.pages} pages • {file.type === "nfrr" ? `${file.reforms.length} reforms mapped` : "Indexed"}
                    </p>
                  </div>
                  {file.type === "nfrr" && (
                    <span className="rounded-full bg-gov-teal-light px-2 py-0.5 text-[10px] font-semibold text-gov-teal shrink-0">NFRR</span>
                  )}
                  <button onClick={() => handleRemoveFile(i)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}

              {/* Generate Report Button */}
              <Button
                onClick={handleGenerateReport}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Table2 className="h-4 w-4" />}
                Generate Auto-Report (HLC-B / NFRR Only)
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Report Table Preview */}
        {reportGenerated && reportRows.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-border overflow-hidden">
            <div className="bg-secondary/50 px-4 py-2 border-b border-border flex items-center gap-2">
              <Table2 className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Auto-Generated Report — HLC-NFRR Sameeksha Portal</span>
              <span className="text-[10px] text-muted-foreground ml-auto">{reportRows.length} recommendations</span>
            </div>
            <div className="overflow-x-auto max-h-[320px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-[10px] min-w-[1200px]">
                <thead className="bg-muted/60 sticky top-0">
                  <tr>
                    {["S.No.", "Recommendation", "Implementing Ministry", "Acts/Rules", "Other Ministries", "Timeline", "Status", "Action Taken", "Delay", "Reason", "Completion"].map(h => (
                      <th key={h} className="px-2 py-2 text-left font-semibold text-foreground border-b border-border whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportRows.map((row, i) => (
                    <tr key={row.sNo} className={`${i % 2 === 0 ? "bg-background" : "bg-muted/20"} hover:bg-accent/30 transition-colors`}>
                      <td className="px-2 py-1.5 font-mono font-semibold text-primary border-b border-border whitespace-nowrap">{row.sNo}</td>
                      <td className="px-2 py-1.5 border-b border-border max-w-[200px] truncate" title={row.recommendation}>{row.recommendation}</td>
                      <td className="px-2 py-1.5 border-b border-border max-w-[150px] truncate">{row.implementingMinistry}</td>
                      <td className="px-2 py-1.5 border-b border-border max-w-[150px] truncate" title={row.actsRules}>{row.actsRules}</td>
                      <td className="px-2 py-1.5 border-b border-border">{row.otherMinistries}</td>
                      <td className="px-2 py-1.5 border-b border-border whitespace-nowrap">{row.timeline}</td>
                      <td className="px-2 py-1.5 border-b border-border whitespace-nowrap">
                        <span className={`inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                          row.status === "Fully implemented" ? "bg-gov-green-light text-gov-green" :
                          row.status === "Partially implemented" ? "bg-gov-blue-light text-gov-blue" :
                          row.status === "Under progress" ? "bg-gov-amber-light text-gov-amber" :
                          row.status === "Yet to initiate" ? "bg-gov-purple-light text-gov-purple" :
                          "bg-gov-red-light text-gov-red"
                        }`}>{row.status}</span>
                      </td>
                      <td className="px-2 py-1.5 border-b border-border max-w-[200px] truncate" title={row.detailsOfAction}>{row.detailsOfAction}</td>
                      <td className="px-2 py-1.5 border-b border-border whitespace-nowrap">{row.delayDays}</td>
                      <td className="px-2 py-1.5 border-b border-border max-w-[120px] truncate">{row.reasonForDelay}</td>
                      <td className="px-2 py-1.5 border-b border-border whitespace-nowrap">{row.timelineForCompletion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-muted/30 px-4 py-1.5 border-t border-border flex items-center gap-2 text-[10px] text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span>Data from portal DB{uploadedFiles.some(f => f.type === "nfrr") ? " + NFRR Report-II document" : ""}. Acts/Rules sourced from uploaded document where available.</span>
            </div>
          </motion.div>
        )}

        {/* Chat Messages */}
        {messages.length > 0 && (
          <div className="max-h-[250px] overflow-y-auto space-y-3 scrollbar-thin">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}>
                  {msg.role === "assistant" && <Sparkles className="inline h-3 w-3 mr-1 text-gov-blue" />}
                  <span className="text-xs leading-relaxed whitespace-pre-line">{msg.content}</span>
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
        )}

        {/* Suggestion Chips */}
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => setDocQuery(s)}
                className="rounded-md bg-secondary px-2.5 py-1 text-[10px] text-secondary-foreground hover:bg-accent transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Query Input */}
        {uploadedFiles.length > 0 && (
          <div className="flex gap-2">
            <Input
              value={docQuery}
              onChange={(e) => setDocQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="Ask about recommendations or request a report (e.g., B-II/5.1)..."
              className="flex-1"
            />
            <Button onClick={handleAsk} size="icon" className="bg-primary text-primary-foreground">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Info when no files */}
        {uploadedFiles.length === 0 && (
          <div className="rounded-lg bg-muted/30 p-4 text-center">
            <FileSearch className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
            <p className="text-xs text-muted-foreground">
              Upload NFRR documents to cross-reference with the HLC-B recommendation database and generate combined reports.
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Serial number mapping: NFRR Report I, 4.2 → B-I/4.2 | NFRR Report II, 5.1 → B-II/5.1
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DocumentIntelligence;
