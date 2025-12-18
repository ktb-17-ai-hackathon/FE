// src/types.ts
import axios from "axios";
import { authApi } from "./api/authApi";

// 설문/플랜 타입 전부 재export
export * from "./types/survey.types";
import type {
  SurveyCreateRequest,
  PlanCreateRequest,
  PlanResponseDto,
} from "./types/survey.types";

// 공통 응답 래퍼
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
   */
  async createSurvey(payload: SurveyCreateRequest): Promise<{ surveyId: number }> {
    const { priorityCriteria, ...rest } = payload;

    // priorityCriteria:
    // - 배열이면 그대로 전송
    // - 문자열("view")로 들어온 경우 안전하게 [string]으로 감싸기
    // - 없으면 빈 배열 또는 null (백엔드 List<String>에 맞춰 보냄)
    const normalizedPriority =
      Array.isArray(priorityCriteria)
        ? priorityCriteria
        : priorityCriteria
        ? [priorityCriteria]
        : [];

    const apiPayload = {
      ...rest,
      priorityCriteria: normalizedPriority,
    };

    console.log("🚀 [createSurvey] payload:", JSON.stringify(apiPayload, null, 2));

    try {
      const res = await http.post<ApiResponse<{ surveyId: number }>>(
        "/surveys",
        apiPayload
      );
      console.log("✅ [createSurvey] response:", res.data);
      return res.data.data;
    } catch (error: any) {
      console.error(
        "❌ [createSurvey] error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * (선택) 기존 플랜 생성: POST /api/plans
   * - mock LLM 결과를 직접 넣어서 테스트할 때만 사용
   * - FastAPI 연동 후에는 createPlanByAi(surveyId)를 주로 사용
   */
  async createPlan(payload: PlanCreateRequest): Promise<{ planId: number }> {
    const res = await http.post<ApiResponse<{ planId: number }>>(
      "/plans",
      payload
    );
    return res.data.data;
  },

  /**
   * 🔥 FastAPI + 백엔드 통해 플랜 생성: POST /api/plans/ai/{surveyId}
   * - body는 비워서 보냄 ({})
   * - 응답으로 PlanResponseDto 전체를 받음
   */
  async createPlanByAi(surveyId: number): Promise<PlanResponseDto> {
    const res = await http.post<ApiResponse<PlanResponseDto>>(
      `/plans/ai/${surveyId}`,
      {}
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
