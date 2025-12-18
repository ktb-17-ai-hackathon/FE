// src/pages/PlanResultPage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  AlertCircle,
  TrendingUp,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Home, // ✅ 추가
} from 'lucide-react';
import { api, type PlanResponseDto } from '../types';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

import { loadCheongyakScoreFromStorage } from '../utils/cheongyakScore';

type ProjectionPoint = {
  year: number;
  amount: number;
};

type ChartPoint = {
  year: number;
  yearLabel: string;
  amount: number;
};

const PlanResultPage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();

  const [plan, setPlan] = useState<PlanResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const llm = plan?.llmRawResult;

  const summary = llm?.summary ?? { title: '', body: '' };
  const diagnosis =
    llm?.diagnosis ?? {
      canBuyWithCheongyak: false,
      confidenceLevel: plan?.confidenceLevel ?? 'MEDIUM',
      reasons: [],
    };
  const timeHorizonStrategy =
    llm?.timeHorizonStrategy ?? { now: '', threeYears: '', fiveYears: '' };
  const planMeta = llm?.planMeta ?? { recommendedHorizon: '', reason: '' };
  const report = llm?.report ?? '';

  console.log('🔍 [PlanResultPage] llm =', llm);
  console.log('🔍 [PlanResultPage] report =', report);
  console.log('🔍 [PlanResultPage] report exists?', !!report);

  const reasons = Array.isArray(diagnosis?.reasons) ? diagnosis.reasons : [];

  const projectionRaw: ProjectionPoint[] = Array.isArray(
    llm?.chartData?.savingProjectionByYear,
  )
    ? (llm!.chartData!.savingProjectionByYear as ProjectionPoint[])
    : [];

  const formatWon = (value: number) => {
    if (!Number.isFinite(value)) return '-';
    const eok = Math.floor(value / 100_000_000);
    const man = Math.floor((value % 100_000_000) / 10_000);

    if (eok <= 0) return `${Math.floor(value / 10_000).toLocaleString()}만원`;
    if (man <= 0) return `${eok.toLocaleString()}억`;
    return `${eok.toLocaleString()}억 ${man.toLocaleString()}만원`;
  };

  const chartData: ChartPoint[] = useMemo(() => {
    return projectionRaw
      .filter(
        (d) =>
          d &&
          typeof d.year === 'number' &&
          typeof d.amount === 'number' &&
          Number.isFinite(d.year) &&
          Number.isFinite(d.amount),
      )
      .map((d) => ({
        year: d.year,
        yearLabel: `${d.year}Y`,
        amount: d.amount,
      }));
  }, [projectionRaw]);

  const createdAtText = plan?.createdAt
    ? new Date(plan.createdAt).toLocaleString()
    : '-';

  const recommendedHorizonText =
    plan?.recommendedHorizon ?? planMeta.recommendedHorizon ?? '-';

  const score = useMemo(() => {
    const sid = plan?.surveyId ?? (surveyId ? Number(surveyId) : null);
    return loadCheongyakScoreFromStorage(Number.isFinite(sid as number) ? (sid as number) : null);
  }, [plan?.surveyId, surveyId]);

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value?: number }>;
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;

    const amount = Number(payload[0]?.value);
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-sm">
        <div className="font-semibold text-gray-800">{label}</div>
        <div className="text-gray-600 mt-1">
          예상 자산:{' '}
          <span className="font-semibold text-gray-900">
            {formatWon(amount)}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-200 rounded-full mb-4" />
          <div className="text-gray-400 font-medium">결과를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500 font-semibold">{error}</div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">데이터를 찾을 수 없습니다.</div>
      </div>
    );
  }

  if (!plan.llmRawResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">플랜 데이터가 비어 있습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ✅ 홈으로 돌아가기 버튼 추가 */}
        <div className="flex justify-start mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-medium transition-all shadow-sm"
          >
            <Home className="w-4 h-4" />
            홈으로 돌아가기
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                Survey
              </span>
              <span className="text-gray-400 text-xs">{createdAtText}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              AI 청약·주거 설계 리포트
            </h1>
          </div>
        </div>

        {/* 청약 가점 카드 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-gray-700">추정 청약 가점</div>
              <div className="mt-1 text-3xl font-extrabold text-gray-900">
                {score ? `${score.total}점` : '-'}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {score?.note ?? '※ 설문 저장 시 계산된 가점 정보가 없습니다.'}
              </div>
            </div>
            {score && (
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between gap-4">
                  <span>무주택기간</span>
                  <span className="font-semibold text-gray-900">
                    {score.breakdown.unhousedScore}점
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>부양가족</span>
                  <span className="font-semibold text-gray-900">
                    {score.breakdown.dependentsScore}점
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>가입기간</span>
                  <span className="font-semibold text-gray-900">
                    {score.breakdown.subscriptionScore}점
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 1. Summary */}
        <div className="bg-white rounded-2xl shadow-lg border-l-4 border-blue-600 overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 leading-snug">
              {summary.title}
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">{summary.body}</p>
          </div>
        </div>

        {/* 2. Diagnosis */}
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
                <li className="text-gray-500">진단 사유 데이터가 아직 없습니다.</li>
              ) : (
                reasons.map((reason: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-600">
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
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <span className="text-sm font-bold text-slate-600">1Y</span>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="font-bold text-slate-900 mb-1">지금 ~ 1년</div>
                <div className="text-slate-500 text-sm">{timeHorizonStrategy.now}</div>
              </div>
            </div>
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <span className="text-sm font-bold text-blue-600">3Y</span>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-blue-100 shadow-sm ring-1 ring-blue-100">
                <div className="font-bold text-blue-900 mb-1">3년 차 (준비기)</div>
                <div className="text-slate-500 text-sm">{timeHorizonStrategy.threeYears}</div>
              </div>
            </div>
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-indigo-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <span className="text-sm font-bold text-indigo-600">5Y</span>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-indigo-100 shadow-sm ring-1 ring-indigo-100">
                <div className="font-bold text-indigo-900 mb-1">5년 차 (목표 달성)</div>
                <div className="text-slate-500 text-sm">{timeHorizonStrategy.fiveYears}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            5년 자산 성장 시뮬레이션
          </h3>
          {chartData.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-4 text-gray-500">
              그래프 데이터가 없습니다.
            </div>
          ) : (
            <div className="w-full h-72 bg-white rounded-xl border border-gray-100">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 24, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="yearLabel" />
                  <YAxis tickFormatter={(v) => formatWon(Number(v))} width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-4 p-4 bg-gray-50 rounded-xl text-sm text-gray-600 flex gap-2">
            <span className="font-bold shrink-0">추천 기간:</span>
            <span>
              {recommendedHorizonText} - {planMeta.reason || '-'}
            </span>
          </div>
        </div>

        {/* 5. Report 섹션 */}
        {report && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              상세 분석 리포트
            </h3>
            <div className="prose max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {report}
              </div>
            </div>
          </div>
        )}

        {/* 6. 경고 문구 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="space-y-3">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="font-bold mb-1">대출 연계 수수료(수익 창출)에 대한 안내</div>
              <p className="leading-relaxed">
                분석 결과에 포함된 일부 대출 상품은 제휴 금융사와 연계되어 있으며,
                이용 시 서비스 운영을 위한 제휴 수수료가 발생할 수 있습니다.
              </p>
              <p className="leading-relaxed mt-2 font-medium">
                이는 사용자에게 추가 비용을 부과하는 것은 아닙니다.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
              <div className="font-bold mb-1">분석 결과를 맹신하지 말아주세요</div>
              <p className="leading-relaxed">
                주거 계획은 한 번 세우고 끝나는 것이 아니라, 삶의 변화에 따라 계속 조정되는
                설계에 가깝습니다.
              </p>
              <p className="leading-relaxed mt-2">
                소득·가족·대출·청약 제도에 변화가 생기면 다시 한 번 분석을 받아보는 것이 좋아요.
              </p>
            </div>
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