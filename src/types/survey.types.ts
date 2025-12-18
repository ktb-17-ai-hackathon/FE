export type MarryStatus = "single" | "married" | "divorced_or_widowed";
export type SubscriptionType = "public" | "private" | "both";
export type DebtType = "housing" | "student" | "credit" | "mixed" | "none";
export type DebtInterestRateBand = "LT_2" | "BETWEEN_2_4" | "BETWEEN_4_6" | "GT_6" | "UNKNOWN";
export type PriorityCriteria = "transport" | "commute" | "school" | "commercial" | "price" | "park" | "view" | "other";

export interface SurveyCreateRequest {
  // ========== 1. 기본 정보 ==========
  age?: number;
  marryStatus?: MarryStatus;
  fMarryStatus?: boolean | null;  // null 추가

  // ========== 2. 가족 & 자녀 계획 ==========
  childCount?: number;
  fChildCount?: number;
  isDoubleIncome?: boolean | null;  // null 추가
  fIsDoubleIncome?: boolean | null;  // null 추가
  willContinueDoubleIncome?: boolean | null;  // null 추가

  // ========== 3. 현재 집/부모 관련 ==========
  currentDistrict?: string;
  isHouseholder?: boolean | null;  // null 추가
  hasOwnedHouse?: boolean | null;  // null 추가
  unhousedStartYear?: number;
  isSupportingParents?: boolean | null;  // null 추가
  fIsSupportingParents?: boolean | null;  // null 추가

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
  hasDebt?: boolean | null;  // null 추가
  debtType?: DebtType;
  debtPrincipal?: number;
  debtInterestRateBand?: DebtInterestRateBand;
  debtPrincipalPaid?: number;
  monthlyDebtPayment?: number;

  // ========== 5. 청약 준비 ==========
  hasSubscriptionAccount?: boolean | null;  // null 추가
  subscriptionStartDate?: string;
  fSubscriptionStartDate?: string;
  monthlySubscriptionAmount?: number;
  totalSubscriptionBalance?: number;

  // ========== 6. 집 선호 ==========
  targetSubscriptionType?: SubscriptionType;
  preferredRegion?: string;
  priorityCriteria?: PriorityCriteria[];
  preferredHousingSize?: string;
}