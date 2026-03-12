import { useState } from "react";
import AIHeader from "@/components/ai/AIHeader";
import ExecutiveSummary from "@/components/ai/ExecutiveSummary";
import KPICards from "@/components/ai/KPICards";
import RiskSnapshot from "@/components/ai/RiskSnapshot";
import MinistryMatrix from "@/components/ai/MinistryMatrix";

import RecommendationSearch from "@/components/ai/RecommendationSearch";
import RecommendationDetail from "@/components/ai/RecommendationDetail";
import ActionablePanels from "@/components/ai/ActionablePanels";
import DocumentIntelligence from "@/components/ai/DocumentIntelligence";
import AIQueryAssistant from "@/components/ai/AIQueryAssistant";
import { recommendations } from "@/data/hlcMockData";
import type { Recommendation } from "@/data/hlcTypes";

const AIAssistance = () => {
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);

  const handleSearch = (query: string) => {
    console.log("AI Search:", query);
  };

  const handleRecSearch = (id: string) => {
    const found = recommendations.find(r => r.serialNo.toLowerCase().includes(id.toLowerCase()));
    if (found) setSelectedRec(found);
  };

  return (
    <div className="min-h-screen bg-background">
      <AIHeader onSearch={handleSearch} onRecSearch={handleRecSearch} />

      <main className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        <ExecutiveSummary />
        <KPICards />
        <RiskSnapshot />
        <MinistryMatrix />
        
        <RecommendationSearch onSelectRec={setSelectedRec} />
        <ActionablePanels onSelectRec={setSelectedRec} />
        <div className="grid gap-6 lg:grid-cols-2">
          <DocumentIntelligence />
          <AIQueryAssistant />
        </div>
      </main>

      {selectedRec && (
        <RecommendationDetail recommendation={selectedRec} onClose={() => setSelectedRec(null)} />
      )}
    </div>
  );
};

export default AIAssistance;
