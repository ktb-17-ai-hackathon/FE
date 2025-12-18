// src/pages/SurveyPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import {
  api,
  type SurveyCreateRequest,
  type PlanHorizon,
  type ConfidenceLevel,
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
  const [formData, setFormData] = useState<SurveyCreateRequest>({});

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

      // 1) 설문 저장
      const { surveyId } = await api.createSurvey(formData);

      // 2) FastAPI 연동 전까지는 프론트에서 임시 mock LLM 결과 만들어서 보내기
      const mockLlmResult = {
        summary: {
          title: '5년 안에 수도권 아파트 도전이 가능합니다.',
          body:
            '현재 연 소득과 자산, 저축 여력을 고려했을 때, 5년 안에 실거주용 아파트 청약을 목표로 하는 전략이 유효합니다.',
        },
        diagnosis: {
          canBuyWithCheongyak: true,
          confidenceLevel: 'MEDIUM',
          reasons: [
            '무주택 + 청약 통장 보유',
            '현재 자산과 저축 여력이 목표 지역 입지 대비 나쁘지 않습니다.',
          ],
        },
        timeHorizonStrategy: {
          now: '지금은 청약 통장 납입액을 최소 기준 이상으로 맞추고, 부채 비율을 관리하는 시기입니다.',
          threeYears:
            '3년 차에는 청약 가점, 무주택 기간, 소득 요건을 다시 점검하고, 직장/생활권에 맞는 후보 지역을 2~3곳으로 압축하세요.',
          fiveYears:
            '5년 차에는 실제 청약 일정과 분양 공고를 캘린더로 관리하면서, 계약금/중도금 마련 플랜을 구체화하는 단계입니다.',
        },
        chartData: {
          savingProjectionByYear: [
            { year: 0, amount: formData.currentFinancialAssets ?? 80000000 },
            { year: 1, amount: 105000000 },
            { year: 2, amount: 130000000 },
            { year: 3, amount: 155000000 },
            { year: 4, amount: 180000000 },
            { year: 5, amount: 205000000 },
          ],
        },
        planMeta: {
          recommendedHorizon: 'MID_5',
          reason: '5년 차에 가용 예산이 목표치에 도달하는 구간으로 추정됩니다.',
        },
      };

      await api.createPlan({
        surveyId,
        llmRawResult: mockLlmResult,
        recommendedHorizon: 'MID_5' as PlanHorizon,
        confidenceLevel: 'MEDIUM' as ConfidenceLevel,
      });

      navigate(`/plan/${surveyId}`);
    } catch (error) {
      console.error(error);
      alert('분석 중 오류가 발생했습니다.');
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
