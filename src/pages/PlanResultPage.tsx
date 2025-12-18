// src/pages/PlanResultPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { api, type PlanResponseDto } from '../types';

const PlanResultPage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [plan, setPlan] = useState<PlanResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('render PlanResultPage', { loading, error, plan });

  useEffect(() => {
    if (!surveyId) return;

    setLoading(true);
    setError(null);

    api
      .getPlanBySurveyId(Number(surveyId))
      .then((data) => {
        console.log('getPlanBySurveyId raw =', data);
        setPlan(data);
      })
      .catch((err: unknown) => {
        console.error(err);
        setError('결과를 불러오는 중 오류가 발생했습니다.');
      })
      .finally(() => setLoading(false));
  }, [surveyId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-200 rounded-full mb-4" />
          <div className="text-gray-400 font-medium">
            결과를 불러오는 중...
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500 font-semibold">{error}</div>
      </div>
    );

  if (!plan) return <div>데이터를 찾을 수 없습니다.</div>;

  // ✅ llmRawResult 방어
  if (!plan.llmRawResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">플랜 데이터가 비어 있습니다.</div>
      </div>
    );
  }

  // ✅ 안전하게 꺼내기(부분 필드 누락되어도 화면이 안 죽게)
  const llm = plan.llmRawResult;

  const summary = llm.summary ?? { title: '', body: '' };
  const diagnosis =
    llm.diagnosis ?? {
      canBuyWithCheongyak: false,
      confidenceLevel: plan.confidenceLevel ?? 'MEDIUM',
      reasons: [],
    };
  const timeHorizonStrategy =
    llm.timeHorizonStrategy ?? { now: '', threeYears: '', fiveYears: '' };
  const chartData = llm.chartData ?? { savingProjectionByYear: [] };
  const planMeta = llm.planMeta ?? { recommendedHorizon: '', reason: '' };

  const reasons = Array.isArray(diagnosis.reasons) ? diagnosis.reasons : [];
  const projection = Array.isArray(chartData.savingProjectionByYear)
    ? chartData.savingProjectionByYear
    : [];

  const { recommendedHorizon, confidenceLevel, createdAt } = plan;

  // 신뢰도에 따른 색상 뱃지
  const getConfidenceColor = (level?: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-green-100 text-green-700';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700';
      case 'LOW':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const createdAtText = createdAt
    ? new Date(createdAt).toLocaleString()
    : '-';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                Survey #{plan.surveyId}
              </span>
              <span className="text-gray-400 text-xs">{createdAtText}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              AI 청약·주거 설계 리포트
            </h1>
          </div>
          <div
            className={`px-4 py-2 rounded-full font-medium text-sm flex items-center gap-1.5 ${getConfidenceColor(
              confidenceLevel || diagnosis.confidenceLevel,
            )}`}
          >
            <CheckCircle className="w-4 h-4" />
            신뢰도: {confidenceLevel || diagnosis.confidenceLevel}
          </div>
        </div>

        {/* 1. Summary Card (Highlight) */}
        <div className="bg-white rounded-2xl shadow-lg border-l-4 border-blue-600 overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 leading-snug">
              {summary.title}
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {summary.body}
            </p>
          </div>
        </div>

        {/* 2. Diagnosis & Reasons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3 bg-white rounded-2xl shadow-sm p-6">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              청약 가능성 진단
            </h3>
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <p className="text-blue-800 font-semibold text-lg text-center">
                {diagnosis.canBuyWithCheongyak
                  ? '🚀 현재 조건으로 충분히 도전 가능합니다!'
                  : '🤔 현재로서는 전략 수정이 필요합니다.'}
              </p>
            </div>

            <ul className="space-y-3">
              {reasons.length === 0 ? (
                <li className="text-gray-500">
                  진단 사유 데이터가 아직 없습니다.
                </li>
              ) : (
                reasons.map((reason: string, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-gray-600"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* 3. Time Horizon Strategy */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-6">
            <Calendar className="w-5 h-5 text-blue-600" />
            기간별 실행 전략
          </h3>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {/* 1년차 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <span className="text-sm font-bold text-slate-600">1Y</span>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-900">지금 ~ 1년</div>
                </div>
                <div className="text-slate-500 text-sm">
                  {timeHorizonStrategy.now}
                </div>
              </div>
            </div>

            {/* 3년차 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <span className="text-sm font-bold text-blue-600">3Y</span>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-blue-100 shadow-sm ring-1 ring-blue-100">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-blue-900">
                    3년 차 (준비기)
                  </div>
                </div>
                <div className="text-slate-500 text-sm">
                  {timeHorizonStrategy.threeYears}
                </div>
              </div>
            </div>

            {/* 5년차 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-indigo-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <span className="text-sm font-bold text-indigo-600">5Y</span>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-indigo-100 shadow-sm ring-1 ring-indigo-100">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-indigo-900">
                    5년 차 (목표 달성)
                  </div>
                </div>
                <div className="text-slate-500 text-sm">
                  {timeHorizonStrategy.fiveYears}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Chart Placeholder */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            5년 자산 성장 시뮬레이션
          </h3>
          <div className="bg-slate-900 rounded-xl p-6 font-mono text-sm overflow-x-auto">
            <p className="text-gray-400 mb-2">// 그래프 영역 (Recharts 연동 예정)</p>
            <pre className="text-green-400">
              {JSON.stringify(projection, null, 2)}
            </pre>
          </div>

          {/* Recommendation Meta */}
          <div className="mt-4 p-4 bg-gray-50 rounded-xl text-sm text-gray-600 flex gap-2">
            <span className="font-bold shrink-0">추천 기간:</span>
            <span>
              {(recommendedHorizon ?? planMeta.recommendedHorizon) || '-'} -{' '}
              {planMeta.reason || '-'}
            </span>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-center pt-8 pb-12">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            다른 조건으로 다시 설계하기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlanResultPage;
