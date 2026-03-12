import { useNavigate } from "react-router-dom";
import { Sparkles, Menu, ChevronDown, CheckCircle2, Clock, AlertTriangle, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { recommendations } from "@/data/hlcMockData";

const Index = () => {
  const navigate = useNavigate();

  const statusIcon = (status: string) => {
    switch (status) {
      case "Fully implemented": return <CheckCircle2 className="h-4 w-4 text-gov-green" />;
      case "Under progress": return <Clock className="h-4 w-4 text-gov-amber" />;
      case "Yet to initiate": return <Hourglass className="h-4 w-4 text-gov-orange" />;
      default: return <AlertTriangle className="h-4 w-4 text-gov-red" />;
    }
  };

  const statusBadge = (status: string) => {
    const cls: Record<string, string> = {
      "Fully implemented": "bg-gov-green-light text-gov-green",
      "Partially implemented": "bg-gov-teal-light text-gov-teal",
      "Under progress": "bg-gov-amber-light text-gov-amber",
      "Yet to initiate": "bg-gov-orange-light text-gov-orange",
      "No action": "bg-gov-red-light text-gov-red",
    };
    return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls[status] || ""}`}>{status}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="bg-gov-navy px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Menu className="h-5 w-5 text-primary-foreground" />
            <div>
              <h1 className="text-sm font-bold text-primary-foreground font-display">HLC Sameeksha Portal</h1>
              <p className="text-[10px] text-primary-foreground/70">Roadmap and Implementation - Government of India</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/ai-assistance")}
              className="bg-gov-amber text-foreground hover:bg-gov-amber/90 font-semibold shadow-gov"
            >
              <Sparkles className="mr-1.5 h-4 w-4" />
              AI Insights
            </Button>
            <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground text-xs">
              Programme Director
            </Badge>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold text-foreground mb-3">Select Option(s)</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {["Ministry", "Department", "HLC", "Report No"].map(label => (
              <div key={label}>
                <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                <div className="flex items-center justify-between rounded-md border border-input bg-card px-3 py-2 text-xs text-muted-foreground">
                  {label === "HLC" ? "HLC-B - High Level Committee on Non-Financial Regulatory Reforms" : "Select"}
                  <ChevronDown className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm">Reset</Button>
            <Button size="sm" className="bg-primary text-primary-foreground">Apply</Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">{recommendations.length} recommendations</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Multiple Approval</Button>
            <Button size="sm" className="bg-primary text-primary-foreground">Download</Button>
          </div>
        </div>

        <div className="card-gov overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  {["Serial No.", "Description", "Recommendations", "Timeline", "Primary Ministry", "Implementing Ministry", "Status", "Action Taken"].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recommendations.slice(0, 8).map(rec => (
                  <tr key={rec.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-3 py-3 text-xs font-medium text-primary whitespace-nowrap">{rec.serialNo}</td>
                    <td className="px-3 py-3 text-xs text-foreground max-w-[180px] truncate">{rec.description}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{rec.recommendationText}</td>
                    <td className="px-3 py-3 text-xs text-foreground whitespace-nowrap">{rec.timeline}</td>
                    <td className="px-3 py-3 text-xs text-foreground max-w-[150px] truncate">{rec.primaryMinistry}</td>
                    <td className="px-3 py-3 text-xs text-foreground max-w-[150px] truncate">{rec.implementingMinistry}</td>
                    <td className="px-3 py-3">{statusBadge(rec.implementationStatus)}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground max-w-[250px] truncate">{rec.detailsOfActionTaken}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
