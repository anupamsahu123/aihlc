import { useState } from "react";
import { Search, Sparkles, ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { suggestedPrompts } from "@/data/hlcMockData";

interface AIHeaderProps {
  onSearch: (query: string) => void;
  onRecSearch: (id: string) => void;
}

const AIHeader = ({ onSearch, onRecSearch }: AIHeaderProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [recId, setRecId] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "HLC-A", "HLC-B", "Report-I", "Report-II"];

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleRecSearch = () => {
    if (recId.trim()) onRecSearch(recId.trim());
  };

  return (
    <div className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      {/* Top Bar */}
      <div className="bg-gov-navy px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-primary-foreground hover:bg-gov-navy-light"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Portal
            </Button>
            <div className="h-5 w-px bg-primary-foreground/20" />
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gov-amber" />
              <span className="font-display text-lg font-semibold text-primary-foreground">
                HLC Sameeksha – AI Assistance
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground text-xs">
              Programme Director
            </Badge>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="mb-3">
          <p className="text-sm text-muted-foreground">
            Executive insights, recommendation intelligence, ministry performance analytics, and document-based Q&A
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
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
          {/* AI Search */}
          <div className="relative flex-1">
            <div className="relative">
              <Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gov-blue" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(e.target.value.length === 0);
                }}
                onFocus={() => setShowSuggestions(query.length === 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ask AI: 'Which recommendations are overdue?' or 'Summarize MCA recommendations'"
                className="pl-10 pr-20 border-gov-blue/30 focus-visible:ring-gov-blue/40"
              />
              <Button
                size="sm"
                onClick={handleSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground hover:bg-gov-blue-light"
              >
                Ask AI
              </Button>
            </div>
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-card p-2 shadow-gov-lg z-50">
                <p className="mb-1.5 px-2 text-xs font-medium text-muted-foreground">Suggested queries</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedPrompts.slice(0, 6).map((p) => (
                    <button
                      key={p}
                      onMouseDown={() => {
                        setQuery(p);
                        onSearch(p);
                        setShowSuggestions(false);
                      }}
                      className="rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground hover:bg-accent transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommendation ID Search */}
          <div className="flex w-full md:w-72">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={recId}
                onChange={(e) => setRecId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRecSearch()}
                placeholder="Rec ID (e.g., B-I/4.10.2)"
                className="pl-10"
              />
            </div>
            <Button onClick={handleRecSearch} size="icon" variant="outline" className="ml-1">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIHeader;
