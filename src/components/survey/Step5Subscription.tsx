import React from 'react';
import { BookOpen, Calendar, Wallet, TrendingUp, CheckCircle } from 'lucide-react';
import type { SurveyCreateRequest } from '../../types/survey.types';

interface Props {
  data: SurveyCreateRequest;
  updateData: (data: Partial<SurveyCreateRequest>) => void;
}

const Step5Subscription: React.FC<Props> = ({ data, updateData }) => {
  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none bg-blue-50 focus:bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";
  const hintClass = "text-xs text-gray-500 mt-1.5 flex items-start gap-1";

  const formatCurrency = (value: number) => {
    return (value / 10000).toFixed(0) + '만원';
  };

  // 청약 통장 가입 기간 계산
  const calculateSubscriptionPeriod = () => {
    if (!data.subscriptionStartDate) return null;
    const start = new Date(data.subscriptionStartDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    return { years, months, totalMonths: diffMonths };
  };

  const subscriptionPeriod = calculateSubscriptionPeriod();

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center pb-6 border-b">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">청약 준비 상태</h2>
        <p className="text-gray-600">지금 어디까지 와 있나요?</p>
      </div>

      {/* 1. 청약 통장 보유 여부 - 필수 */}
      <div>
        <label className={labelClass}>
          <CheckCircle className="w-4 h-4 inline mr-1" />
          청약 통장을 가지고 있나요? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateData({ 
              hasSubscriptionAccount: true,
              fSubscriptionStartDate: undefined
            })}
            className={`
              py-4 rounded-xl font-medium transition-all
              ${data.hasSubscriptionAccount === true
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            예 ✅
          </button>
          <button
            type="button"
            onClick={() => updateData({ 
              hasSubscriptionAccount: false,
              subscriptionStartDate: undefined,
              monthlySubscriptionAmount: 0,
              totalSubscriptionBalance: 0
            })}
            className={`
              py-4 rounded-xl font-medium transition-all
              ${data.hasSubscriptionAccount === false
                ? 'bg-gray-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            아니요
          </button>
        </div>
      </div>

      {/* 청약 통장이 있을 경우 */}
      {data.hasSubscriptionAccount === true && (
        <>
          {/* 2. 가입 시작 시점 */}
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
            <label className={labelClass}>
              <Calendar className="w-4 h-4 inline mr-1" />
              언제부터 청약 통장을 넣기 시작했나요?
            </label>
            <input
              type="month"
              value={data.subscriptionStartDate || ''}
              onChange={(e) => updateData({ subscriptionStartDate: e.target.value })}
              className={inputClass}
              max={new Date().toISOString().slice(0, 7)}
            />
            {subscriptionPeriod && (
              <div className="mt-3 p-3 bg-purple-100 rounded-lg">
                <div className="text-sm font-semibold text-purple-800">
                  📅 가입 기간: {subscriptionPeriod.years}년 {subscriptionPeriod.months}개월
                </div>
                <div className="text-xs text-purple-600 mt-1">
                  총 {subscriptionPeriod.totalMonths}개월 (납입 횟수)
                </div>
              </div>
            )}
            <p className={hintClass}>
              <span className="shrink-0">💡</span>
              <span>없으면 미선택해주세요.</span>
            </p>
          </div>

          {/* 4. 월 납입액 */}
          <div>
            <label className={labelClass}>
              <TrendingUp className="w-4 h-4 inline mr-1" />
              매달 청약 통장에 넣는 금액은 얼마인가요?
            </label>
            <input
              type="number"
              value={data.monthlySubscriptionAmount || ''}
              onChange={(e) => updateData({ monthlySubscriptionAmount: Number(e.target.value) })}
              className={inputClass}
              placeholder="예: 100000 (10만원), 없으면 0"
              step="10000"
            />
            {data.monthlySubscriptionAmount && data.monthlySubscriptionAmount > 0 && (
              <div className="mt-2 text-sm text-purple-600 font-medium">
                월 {formatCurrency(data.monthlySubscriptionAmount)}
              </div>
            )}
          </div>

          {/* 5. 현재 잔액 */}
          <div>
            <label className={labelClass}>
              <Wallet className="w-4 h-4 inline mr-1" />
              지금까지 청약 통장에 모인 금액은 얼마인가요?
            </label>
            <input
              type="number"
              value={data.totalSubscriptionBalance || ''}
              onChange={(e) => updateData({ totalSubscriptionBalance: Number(e.target.value) })}
              className={inputClass}
              placeholder="예: 5000000 (500만원), 없으면 0"
              step="100000"
            />
            {data.totalSubscriptionBalance && data.totalSubscriptionBalance > 0 && (
              <div className="mt-2 text-sm text-purple-600 font-semibold">
                약 {formatCurrency(data.totalSubscriptionBalance)}
              </div>
            )}
            <p className={hintClass}>
              <span className="shrink-0">💡</span>
              <span>일부 청약은 청약 통장에 '얼마 이상 모였는지'가 조건이 됩니다.</span>
            </p>
          </div>

          {/* 청약 통장 요약 */}
          {data.subscriptionStartDate && data.totalSubscriptionBalance && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                청약 통장 요약
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">가입 기간</span>
                  <span className="font-semibold text-purple-700">
                    {subscriptionPeriod?.years}년 {subscriptionPeriod?.months}개월
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">총 납입 횟수</span>
                  <span className="font-semibold text-purple-700">
                    {subscriptionPeriod?.totalMonths}회
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">현재 잔액</span>
                  <span className="font-semibold text-purple-700">
                    {formatCurrency(data.totalSubscriptionBalance)}
                  </span>
                </div>
                {data.monthlySubscriptionAmount && data.monthlySubscriptionAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">월 납입액</span>
                    <span className="font-semibold text-indigo-700">
                      {formatCurrency(data.monthlySubscriptionAmount)}
                    </span>
                  </div>
                )}
                {subscriptionPeriod && subscriptionPeriod.totalMonths > 0 && (
                  <div className="pt-3 border-t border-purple-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">평균 월 납입 추정</span>
                      <span className="font-bold text-lg text-purple-700">
                        약 {formatCurrency(Math.floor(data.totalSubscriptionBalance / subscriptionPeriod.totalMonths))}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* 청약 통장이 없을 경우 */}
      {data.hasSubscriptionAccount === false && (
        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
          <div className="text-center mb-4">
            <div className="text-5xl mb-3">📋</div>
            <h3 className="text-lg font-bold text-amber-800 mb-2">청약 통장 만들기</h3>
            <p className="text-sm text-amber-700">
              청약 통장은 집 마련의 첫걸음입니다
            </p>
          </div>

          {/* 3. 없다면 만들 계획 */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 bg-amber-600 text-white text-xs font-bold rounded">미래 계획</span>
              <span className="text-amber-700 text-xs">선택 사항</span>
            </div>
            <label className={labelClass}>
              <Calendar className="w-4 h-4 inline mr-1" />
              언제쯤 만들 계획인가요?
            </label>
            <input
              type="month"
              value={data.fSubscriptionStartDate || ''}
              onChange={(e) => updateData({ fSubscriptionStartDate: e.target.value })}
              className={inputClass}
              min={new Date().toISOString().slice(0, 7)}
            />
            <p className={hintClass}>
              <span className="shrink-0">💡</span>
              <span>계획이 없으면 비워두셔도 괜찮아요. 다만 청약 통장은 빨리 만들수록 유리합니다.</span>
            </p>
          </div>

          <div className="mt-4 p-4 bg-white rounded-lg border border-amber-200">
            <h4 className="font-semibold text-gray-800 mb-2 text-sm">청약 통장 꿀팁</h4>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>✓ 은행 어디서나 가입 가능 (시중은행, 우체국)</li>
              <li>✓ 가입 즉시부터 기간 카운트 시작</li>
              <li>✓ 최소 월 2만원만 넣어도 유지 가능</li>
              <li>✓ 1년 이상 유지 시 청약 자격 획득</li>
            </ul>
          </div>
        </div>
      )}

      {/* 전체 안내 카드 */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
        <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          청약 통장 체크포인트
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <span className="shrink-0 font-bold">1.</span>
            <span>가입 기간이 길수록 가점이 높아집니다 (최대 15년)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="shrink-0 font-bold">2.</span>
            <span>납입 횟수도 중요합니다 (최소 24회 이상 권장)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="shrink-0 font-bold">3.</span>
            <span>일부 청약은 통장 잔액이 기준 금액 이상이어야 합니다</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="shrink-0 font-bold">4.</span>
            <span>납입 인정액은 지역별로 다릅니다 (수도권 최대 300만원)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5Subscription;