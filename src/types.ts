// src/types.ts
import axios from "axios";
import { authApi } from "./api/authApi";

// 설문 타입 전부 재export
export * from "./types/survey.types";
import type { SurveyCreateRequest, PriorityCriteria } from "./types/survey.types";

// ===== 플랜 관련 타입 (백엔드 PlanHorizon / ConfidenceLevel 과 맞춤) =====
export type PlanHorizon = "SHORT_3" | "MID_5" | "LONG_10";
export type ConfidenceLevel = "LOW" | "MEDIUM" | "HIGH";

export interface PlanCreateRequest {
  surveyId: number;
  llmRawResult: any;              // FastAPI/LLM이 만들어 준 JSON 그대로
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

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ===== axios 인스턴스 (/api → 8080 프록시 전제) =====
const http = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// ===== 실제 백엔드 연동용 API =====
export const api = {
  /**
   * 설문 저장: POST /api/surveys
   * 프론트는 priorityCriteria 를 배열로 들고 있고,
   * 백엔드는 String 으로 받으니까 여기서 변환해줍니다.
   */
  async createSurvey(payload: SurveyCreateRequest): Promise<{ surveyId: number }> {
    const { priorityCriteria, ...rest } = payload;

    // BE DTO: String priorityCriteria  (예: "transport,school,price")
    const apiPayload = {
      ...rest,
      priorityCriteria:
        priorityCriteria && priorityCriteria.length > 0
          ? (priorityCriteria as PriorityCriteria[]).join(",")
          : null,
    };

    const res = await http.post<ApiResponse<{ surveyId: number }>>(
      "/surveys",
      apiPayload
    );
    // 응답: { success, message, data: { surveyId } }
    return res.data.data;
  },

  /**
   * 플랜 생성: POST /api/plans
   * (실제 연동 시에는 FastAPI 쪽에서 LLM 결과 받아서 채워줄 예정)
   */
  async createPlan(payload: PlanCreateRequest): Promise<{ planId: number }> {
    const res = await http.post<ApiResponse<{ planId: number }>>(
      "/plans",
      payload
    );
    return res.data.data;
  },

  /**
   * 특정 설문 최신 플랜 조회: GET /api/plans/survey/{surveyId}
   */
  async getPlanBySurveyId(
    surveyId: number | string
  ): Promise<PlanResponseDto> {
    const res = await http.get<ApiResponse<PlanResponseDto>>(
      `/plans/survey/${surveyId}`
    );
    return res.data.data;
  },


    ...authApi, // ✅ 추가 

};
