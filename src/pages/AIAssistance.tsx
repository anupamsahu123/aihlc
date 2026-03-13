import { useState } from "react";
import AIHeader from "@/components/ai/AIHeader";
import ExecutiveSummary from "@/components/ai/ExecutiveSummary";
import KPICards from "@/components/ai/KPICards";
import RiskSnapshot from "@/components/ai/RiskSnapshot";
import RecommendationSearch from "@/components/ai/RecommendationSearch";
import RecommendationDetail from "@/components/ai/RecommendationDetail";
import ActionablePanels from "@/components/ai/ActionablePanels";
import DocumentIntelligence from "@/components/ai/DocumentIntelligence";
import AISearchResponse from "@/components/ai/AISearchResponse";
import DrillDownTable from "@/components/ai/DrillDownTable";
import { recommendations } from "@/data/hlcMockData";
import type { Recommendation } from "@/data/hlcTypes";

const AIAssistance = () => {
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [drillDown, setDrillDown] = useState<{ title: string; items: Recommendation[] } | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setDrillDown(null);
  };

  const handleRecSearch = (id: string) => {
    const found = recommendations.find(r => r.serialNo.toLowerCase().includes(id.toLowerCase()));
    if (found) setSelectedRec(found);
  };

  const handleDrillDown = (title: string, items: Recommendation[]) => {
    setDrillDown({ title, items });
    setSearchQuery(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <AIHeader onSearch={handleSearch} onRecSearch={handleRecSearch} />

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {searchQuery && (
          <AISearchResponse
            query={searchQuery}
            onClose={() => setSearchQuery(null)}
            onSelectRec={setSelectedRec}
          />
        )}

        <ExecutiveSummary />
        <KPICards onDrillDown={handleDrillDown} />
        <RiskSnapshot onDrillDown={handleDrillDown} />

        {drillDown && (
          <DrillDownTable
            title={drillDown.title}
            items={drillDown.items}
            onClose={() => setDrillDown(null)}
            onSelectRec={setSelectedRec}
          />
        )}

        <RecommendationSearch onSelectRec={setSelectedRec} />
        <ActionablePanels onSelectRec={setSelectedRec} />

        <div className="w-full">
          <DocumentIntelligence />
        </div>
      </main>

      {selectedRec && (
        <RecommendationDetail recommendation={selectedRec} onClose={() => setSelectedRec(null)} />
      )}
    </div>
  );
};

export default AIAssistance;
