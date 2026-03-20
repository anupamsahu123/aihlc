import { useState } from "react";
import { Search, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface AIHeaderProps {
  onSearch: (query: string) => void;
  onRecSearch: (id: string) => void;
  activeFilter: "All" | "HLC-A" | "HLC-B";
  onFilterChange: (filter: "All" | "HLC-A" | "HLC-B") => void;
}

const AIHeader = ({ onSearch, onRecSearch, activeFilter, onFilterChange }: AIHeaderProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [recId, setRecId] = useState("");

  const filters: ("All" | "HLC-A" | "HLC-B")[] = ["All", "HLC-A", "HLC-B"];

  const handleSearch = () => {
    if (query.trim()) onSearch(query.trim());
  };

  const handleRecSearch = () => {
    if (recId.trim()) onRecSearch(recId.trim());
  };

  return (
    <div className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="bg-gov-navy px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-primary-foreground hover:bg-gov-navy-light text-sm">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to Portal
            </Button>
            <div className="h-5 w-px bg-primary-foreground/20" />
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gov-amber" />
              <span className="font-display text-lg font-semibold text-primary-foreground">AI Insights</span>
            </div>
          </div>
          <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground text-xs">Programme Director</Badge>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeFilter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Ask: 'Summary of B-I/4.10.2' or 'Which recommendations are overdue?'"
              className="pl-10 pr-20 text-sm"
            />
            <Button size="sm" onClick={handleSearch} className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground">
              Ask AI
            </Button>
          </div>
          <div className="flex w-full md:w-64">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={recId}
                onChange={(e) => setRecId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRecSearch()}
                placeholder="Rec ID (e.g., B-I/4.10.2)"
                className="pl-10 text-sm"
              />
            </div>
            <Button onClick={handleRecSearch} size="icon" variant="outline" className="ml-1.5">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIHeader;
