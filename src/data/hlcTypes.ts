export type ImplementationStatus =
  | "Fully implemented"
  | "Partially implemented"
  | "Under progress"
  | "Yet to initiate"
  | "No action";

export type WorkflowStage =
  | "Ministry Director"
  | "Ministry Approver"
  | "NITI Approver"
  | "Closed";

export type RiskLevel = "High" | "Medium" | "Low";

export type HLCType = "HLC-A" | "HLC-B";

export interface ActionUpdate {
  date: string;
  status: ImplementationStatus;
  actionText: string;
  actor: string;
  actorRole: WorkflowStage;
  outcome?: string;
}

export interface Recommendation {
  id: string;
  serialNo: string;
  description: string;
  recommendationText: string;
  timeline: string;
  timelineDateObj: Date;
  primaryMinistry: string;
  implementingMinistry: string;
  otherImplementingMinistries?: string[];
  implementationStatus: ImplementationStatus;
  currentOwner: WorkflowStage;
  detailsOfActionTaken: string;
  reasonIfNotImplemented?: string;
  updatedTimeline?: string;
  closureRemarks?: string;
  hlcType: HLCType;
  reportNo: string;
  updates: ActionUpdate[];
  delayDays: number;
  riskLevel: RiskLevel;
  hasJustificationDoc: boolean;
}

export interface MinistryPerformance {
  ministry: string;
  total: number;
  fullyImplemented: number;
  partiallyImplemented: number;
  underProgress: number;
  yetToInitiate: number;
  noAction: number;
  overdueCount: number;
  avgDelay: number;
  riskRating: RiskLevel;
  aiRemark: string;
  pendingWithDirector: number;
  pendingWithApprover: number;
  pendingWithNITI: number;
}

export interface KPIData {
  label: string;
  value: number;
  icon: string;
  color: string;
  trend?: string;
}

export interface RiskItem {
  category: string;
  count: number;
  severity: RiskLevel;
  items: string[];
}

export interface DocumentQA {
  question: string;
  answer: string;
  sources?: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  table?: { headers: string[]; rows: string[][] };
  timestamp: Date;
}
