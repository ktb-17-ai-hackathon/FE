import { apiClient } from "./client";
import type { AxiosResponse } from "axios";

export type PlanHorizon = "SHORT_3" | "MID_5" | "LONG_10";
export type ConfidenceLevel = "LOW" | "MEDIUM" | "HIGH";

export interface PlanCreateRequest {
  surveyId: number;
  llmRawResult: any; // LLM JSON 전체
  recommendedHorizon?: PlanHorizon | null;
  confidenceLevel?: ConfidenceLevel | null;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PlanCreateResponse {
  planId: number;
  surveyId: number;
}

export async function createPlan(
  payload: PlanCreateRequest
): Promise<PlanCreateResponse> {
  const res = await apiClient.post<ApiResponse<PlanCreateResponse>>(
    "/plans",
    payload
  );
  return res.data.data;
}

export interface PlanResponseDto {
  planId: number;
  surveyId: number;
  llmRawResult: any;
  recommendedHorizon?: PlanHorizon | null;
  confidenceLevel?: ConfidenceLevel | null;
  createdAt: string;
}

export async function getPlanBySurveyId(
  surveyId: number
): Promise<PlanResponseDto> {
  const res: AxiosResponse<ApiResponse<PlanResponseDto>> =
    await apiClient.get(`/plans/${surveyId}`);
  return res.data.data;
}
