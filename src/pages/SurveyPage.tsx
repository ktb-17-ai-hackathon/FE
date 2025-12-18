// src/pages/SurveyPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import {
  api,
  type SurveyCreateRequest,
} from '../types';

// 스텝 컴포넌트들
import Step1BasicInfo from '../components/survey/Step1BasicInfo';
import Step2Housing from '../components/survey/Step2Housing';
import Step3Income from '../components/survey/Step3Income';
import Step4Debt from '../components/survey/Step4Debt';
import Step5Subscription from '../components/survey/Step5Subscription';
import Step6Preference from '../components/survey/Step6Preference';

const TOTAL_STEPS = 6;

const STEP_TITLES = [
  '기본 정보',
  '주거 상황',
  '소득·자산',
  '부채 정보',
  '청약 준비',
  '집 취향',
];

const SurveyPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SurveyCreateRequest>(
    {} as SurveyCreateRequest
  );

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      console.log('[submit] raw formData = ', formData);

      // -------------------------------
      // 1) formData 정제
      // -------------------------------
      const payload: any = { ...formData };

      // 숫자 필드들: "" → null, 문자열 숫자 → number
      const numberFields = [
        'age',
        'childCount',
        'fChildCount',
        'annualIncome',
        'annualSideIncome',
        'monthlySavingAmount',
        'currentFinancialAssets',
        'additionalAssets',
        'targetSavingRate',
        'debtPrincipal',
        'debtPrincipalPaid',
        'monthlyDebtPayment',
        'monthlySubscriptionAmount',
        'totalSubscriptionBalance',
        'unhousedStartYear',
      ] as const;

      numberFields.forEach((key) => {
        const v = payload[key];
        if (v === '' || v === undefined) {
          payload[key] = null;
        } else if (typeof v === 'string') {
          const parsed = Number(v);
          payload[key] = Number.isNaN(parsed) ? null : parsed;
        }
      });

      // LocalDate용 문자열/Date 보정: "YYYY-MM" → "YYYY-MM-01", Date → "YYYY-MM-DD"
      const normalizeYearMonthToDate = (value: any) => {
        if (value === '' || value === undefined || value === null) {
          return null;
        }

        // Date 객체로 들어온 경우
        if (value instanceof Date) {
          return value.toISOString().slice(0, 10); // YYYY-MM-DD
        }

        if (typeof value === 'string') {
          // 이미 YYYY-MM-DD 형식이면 그대로
          if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return value;
          }
          // YYYY-MM 형식이면 1일로 보정
          if (/^\d{4}-\d{2}$/.test(value)) {
            return `${value}-01`;
          }
        }

        console.warn('[normalizeYearMonthToDate] unexpected value:', value);
        return value;
      };

      payload.subscriptionStartDate = normalizeYearMonthToDate(
        payload.subscriptionStartDate
      );
      payload.fSubscriptionStartDate = normalizeYearMonthToDate(
        payload.fSubscriptionStartDate
      );

      // ===== priorityCriteria 정제 =====
      // 백엔드: List<String>
      // 프론트: 단일 선택일 경우 "view" 같은 string으로 들어올 수 있으니 보정
      if (typeof payload.priorityCriteria === 'string') {
        // 예: "view" → ["view"]
        payload.priorityCriteria = [payload.priorityCriteria];
      } else if (Array.isArray(payload.priorityCriteria)) {
        // 빈 배열이면 null로 보냄
        if (payload.priorityCriteria.length === 0) {
          payload.priorityCriteria = null;
        }
      } else if (payload.priorityCriteria === undefined) {
        payload.priorityCriteria = null;
      }

      console.log('[submit] cleaned payload = ', payload);

      // -------------------------------
      // 2) 설문 저장
      // -------------------------------
      const { surveyId } = await api.createSurvey(payload);
      console.log('[submit] ✅ survey created. surveyId =', surveyId);

      // -------------------------------
      // 3) FastAPI 연동 통해 플랜 생성
      //    - Spring: POST /api/plans/ai/{surveyId} → FastAPI 호출 → Plan 저장 후 반환
      // -------------------------------
      console.log('[submit] ▶ calling createPlanByAi for surveyId =', surveyId);
      const plan = await api.createPlanByAi(surveyId);
      console.log('[submit] ✅ AI plan created = ', plan);

      // -------------------------------
      // 4) 결과 페이지로 이동
      // -------------------------------
      navigate(`/plan/${surveyId}`);
    } catch (error: any) {
      console.error('❌ handleSubmit error = ', error);

      if (error.response) {
        console.error(
          '🔍 backend response.status = ',
          error.response.status
        );
        console.error(
          '🔍 backend response.data = ',
          JSON.stringify(error.response.data, null, 2)
        );
      }

      alert('분석 중 오류가 발생했습니다. 콘솔 로그를 확인해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (data: Partial<SurveyCreateRequest>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo data={formData} updateData={updateFormData} />;
      case 2:
        return <Step2Housing data={formData} updateData={updateFormData} />;
      case 3:
        return <Step3Income data={formData} updateData={updateFormData} />;
      case 4:
        return <Step4Debt data={formData} updateData={updateFormData} />;
      case 5:
        return (
          <Step5Subscription data={formData} updateData={updateFormData} />
        );
      case 6:
        return <Step6Preference data={formData} updateData={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">청약Assist</h1>
          <p className="text-gray-600">나만의 청약·주거 설계</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">
              {STEP_TITLES[currentStep - 1]}
            </span>
            <span className="text-sm text-gray-500">
              {currentStep} / {TOTAL_STEPS}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          {/* 스텝 인디케이터 */}
          <div className="flex justify-between mt-3">
            {STEP_TITLES.map((title, idx) => {
              const stepNumber = idx + 1;
              const isCurrent = stepNumber === currentStep;
              const isDone = stepNumber < currentStep;

              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center ${
                    isCurrent
                      ? 'text-blue-600'
                      : isDone
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isDone
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {isDone ? '✓' : stepNumber}
                  </div>
                  <span className="text-xs hidden sm:block">{title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 min-h-[500px]">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1 || loading}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              currentStep === 1 || loading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 shadow-md'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            이전
          </button>

          <button
            onClick={handleNext}
            disabled={loading}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all shadow-lg ${
              loading
                ? 'bg-blue-400 cursor-not-allowed'
                : currentStep === TOTAL_STEPS
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
            }`}
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                AI가 설계 중입니다...
              </>
            ) : currentStep === TOTAL_STEPS ? (
              <>
                🎯 AI 설계 받아보기
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              <>
                다음
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyPage;
