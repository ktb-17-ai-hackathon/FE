// src/types/survey.types.ts

// ========== Survey 관련 타입 ==========
export type MarryStatus = "single" | "married" | "divorced_or_widowed";
export type SubscriptionType = "public" | "private" | "both";
export type DebtType = "housing" | "student" | "credit" | "mixed" | "none";
export type DebtInterestRateBand =
  | "LT_2"
  | "BETWEEN_2_4"
  | "BETWEEN_4_6"
  | "GT_6"
  | "UNKNOWN";
export type PriorityCriteria =
  | "transport"
  | "commute"
  | "school"
  | "commercial"
  | "price"
  | "park"
  | "view"
  | "other";

export interface SurveyCreateRequest {
  // ========== 1. 기본 정보 ==========
  age?: number;
  marryStatus?: MarryStatus;
  fMarryStatus?: boolean | null;

  // ========== 2. 가족 & 자녀 계획 ==========
  childCount?: number;
  fChildCount?: number;
  isDoubleIncome?: boolean | null;
  fIsDoubleIncome?: boolean | null;
  willContinueDoubleIncome?: boolean | null;

  // ========== 3. 현재 집/부모 관련 ==========
  currentDistrict?: string;
  isHouseholder?: boolean | null;
  hasOwnedHouse?: boolean | null;
  unhousedStartYear?: number;
  isSupportingParents?: boolean | null;
  fIsSupportingParents?: boolean | null;

  // ========== 4. 돈 흐름 ==========
  jobTitle?: string;
  jobDistrict?: string;
  annualIncome?: number;
  annualSideIncome?: number;
  monthlySavingAmount?: number;
  currentFinancialAssets?: number;
  additionalAssets?: number;
  targetSavingRate?: number;

  // 부채
  hasDebt?: boolean | null;
  debtType?: DebtType;
  debtPrincipal?: number;
  debtInterestRateBand?: DebtInterestRateBand;
  debtPrincipalPaid?: number;
  monthlyDebtPayment?: number;

  // ========== 5. 청약 준비 ==========
  hasSubscriptionAccount?: boolean | null;
  subscriptionStartDate?: string;      // "YYYY-MM" or "YYYY-MM-DD"
  fSubscriptionStartDate?: string;     // "YYYY-MM" or "YYYY-MM-DD"
  monthlySubscriptionAmount?: number;
  totalSubscriptionBalance?: number;

  // ========== 6. 집 선호 ==========
  targetSubscriptionType?: SubscriptionType;
  preferredRegion?: string;
  priorityCriteria?: PriorityCriteria[]; // ✅ 배열
  preferredHousingSize?: string;
}

// ========== Plan 관련 타입 ==========
export type PlanHorizon = "SHORT_3" | "MID_5" | "LONG_10";
export type ConfidenceLevel = "LOW" | "MEDIUM" | "HIGH";

/**
 * (기존 /api/plans 에 직접 mock 보내고 싶을 때 쓸 수 있는 타입)
 * FastAPI 연동 후에는 createPlanByAi(surveyId)만 써도 됨
 */
export interface PlanCreateRequest {
  surveyId: number;
  llmRawResult: any;
  recommendedHorizon: PlanHorizon;
  confidenceLevel: ConfidenceLevel;
}

export interface PlanResponseDto {
  planId: number;
  surveyId: number;
  llmRawResult: any;
  recommendedHorizon: PlanHorizon | null;
  confidenceLevel: ConfidenceLevel | null;
  createdAt: string; // LocalDateTime → ISO 문자열
}
