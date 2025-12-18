import { apiClient } from "./client";

export interface SurveyCreateRequest {
  currentSalary: number;
  currentAssets: number;
  futureSalaryChange?: number | null;
  sideIncome?: number | null;

  age: number;
  isNoHome?: boolean | null;
  noHomeStartDate?: string | null; // "YYYY-MM-DD"

  isMarried: boolean;
  childrenCount: number;
  currentResidence: string;

  targetResidence: string;
  targetPreferences?: string | null;
  targetResidents: number;
  targetDeadline?: string | null; // "YYYY-MM-DDTHH:mm:ss"
  notes?: string | null;

  hasSubscriptionAccount: boolean;
  accountJoinedAt?: string | null; // "YYYY-MM-DDTHH:mm:ss"
  accountBalance?: number | null;

  wantsLoan: boolean;
  preferredLoanAmount?: number | null;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface SurveyCreateResponse {
  surveyId: number;
}

export async function createSurvey(
  payload: SurveyCreateRequest
): Promise<number> {
  const response = await apiClient.post<ApiResponse<SurveyCreateResponse>>(
    "/surveys",
    payload
  );
  return response.data.data.surveyId;
}
