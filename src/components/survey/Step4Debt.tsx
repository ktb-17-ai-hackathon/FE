import React from 'react';
import { CreditCard, AlertTriangle, TrendingDown, Calculator, Percent, History, DollarSign } from 'lucide-react';
import type { SurveyCreateRequest } from '../../types/survey.types';

interface Props {
  data: SurveyCreateRequest;
  updateData: (data: Partial<SurveyCreateRequest>) => void;
}

const Step4Debt: React.FC<Props> = ({ data, updateData }) => {
  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none bg-blue-50 focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";
  const hintClass = "text-xs text-gray-500 mt-1.5 flex items-start gap-1";

  // 만원을 원으로 변환
  const manwonToWon = (manwon: number): number => {
    return manwon * 10000;
  };

  // 원을 만원으로 변환
  const wonToManwon = (won: number): number => {
    return won / 10000;
  };

  const formatCurrency = (value: number) => {
    if (value >= 100000000) {
      return (value / 100000000).toFixed(1) + '억원';
    }
    if (value >= 10000000) {
      return (value / 10000000).toFixed(1) + '천만원';
    }
    return (value / 10000).toFixed(0) + '만원';
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center pb-6 border-b">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">자금 흐름 - 부채</h2>
        <p className="text-gray-600">현재 갚고 있는 대출이나 빚이 있나요?</p>
      </div>

      {/* 9. 대출 유무 - 필수 */}
      <div>
        <label className={labelClass}>
          <AlertTriangle className="w-4 h-4 inline mr-1" />
          현재 갚고 있는 대출이나 빚이 있나요? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateData({ 
              hasDebt: false,
              debtType: 'none',
              debtPrincipal: 0,
              debtInterestRateBand: undefined,
              debtPrincipalPaid: 0,
              monthlyDebtPayment: 0
            })}
            className={`
              py-4 rounded-xl font-medium transition-all
              ${data.hasDebt === false
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            없어요 ✨
          </button>
          <button
            type="button"
            onClick={() => updateData({ hasDebt: true })}
            className={`
              py-4 rounded-xl font-medium transition-all
              ${data.hasDebt === true
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            있어요
          </button>
        </div>
        <p className={hintClass}>
          <span className="shrink-0">💡</span>
          <span>같은 소득이어도 <strong>매달 나가는 대출 상환금</strong>에 따라 실제로 집을 준비할 수 있는 여력이 크게 달라져요.</span>
        </p>
      </div>

      {/* 대출이 있을 경우에만 표시 */}
      {data.hasDebt && (
        <>
          {/* 대출 종류 */}
          <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
            <label className={labelClass}>
              어떤 종류의 대출인가요?
            </label>
            <div className="space-y-2">
              {[
                { value: 'housing', label: '주택 관련으로 있어요', desc: '전세자금, 주택담보대출 등' },
                { value: 'student', label: '학자금, 신용 대출 등으로 있어요', desc: '학자금, 생활비 대출, 신용대출' },
                { value: 'mixed', label: '여러 종류가 있어요', desc: '2가지 이상의 대출' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateData({ debtType: option.value as any })}
                  className={`
                    w-full py-3 px-4 rounded-xl text-left transition-all
                    ${data.debtType === option.value
                      ? 'bg-orange-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }
                  `}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className={`text-xs mt-0.5 ${data.debtType === option.value ? 'text-orange-100' : 'text-gray-500'}`}>
                    {option.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 10. 남은 원금 */}
          <div>
            <label className={labelClass}>
              <TrendingDown className="w-4 h-4 inline mr-1" />
              현재 남아 있는 대출 원금은 총 얼마인가요?
            </label>
            <div className="relative">
              <input
                type="number"
                value={data.debtPrincipal ? wonToManwon(data.debtPrincipal) : ''}
                onChange={(e) => updateData({ debtPrincipal: manwonToWon(Number(e.target.value)) })}
                className={inputClass}
                placeholder="예: 5000 (5천만원), 없으면 0"
                step="500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium pointer-events-none">만원</span>
            </div>
            {data.debtPrincipal && data.debtPrincipal > 0 && (
              <div className="mt-2 text-sm text-orange-600 font-semibold">
                💰 {formatCurrency(data.debtPrincipal)}
              </div>
            )}
            <p className={hintClass}>
              <span className="shrink-0">💡</span>
              <span>지금 자산에서 얼마를 빼고 생각해야 하는지를 보기 위한 질문이에요.</span>
            </p>
          </div>

          {/* 11. 이자율 */}
          <div>
            <label className={labelClass}>
              <Percent className="w-4 h-4 inline mr-1" />
              평균적으로 적용되는 이자율은 어느 정도인가요?
            </label>
            <div className="space-y-2">
              {[
                { value: 'LT_2', label: '2% 이하', color: '#16a34a' },
                { value: 'BETWEEN_2_4', label: '2~4%', color: '#2563eb' },
                { value: 'BETWEEN_4_6', label: '4~6%', color: '#eab308' },
                { value: 'GT_6', label: '6% 이상', color: '#dc2626' },
                { value: 'UNKNOWN', label: '잘 모르겠어요', color: '#6b7280' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateData({ debtInterestRateBand: option.value as any })}
                  className={`
                    w-full py-3 px-4 rounded-xl font-medium transition-all
                    ${data.debtInterestRateBand === option.value
                      ? 'text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                  style={{
                    backgroundColor: data.debtInterestRateBand === option.value ? option.color : undefined
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className={hintClass}>
              <span className="shrink-0">💡</span>
              <span>정확하지 않아도 괜찮아요. 대략적인 수준만 선택해 주세요. <strong>이자율이 높을수록 청약보다 부채 정리 우선 전략이 나을 수 있어요.</strong></span>
            </p>
          </div>

          {/* 12. 상환 이력 */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <label className={labelClass}>
              <History className="w-4 h-4 inline mr-1" />
              지금까지 대출을 얼마나 갚았나요?
            </label>
            <div className="relative">
              <input
                type="number"
                value={data.debtPrincipalPaid ? wonToManwon(data.debtPrincipalPaid) : ''}
                onChange={(e) => updateData({ debtPrincipalPaid: manwonToWon(Number(e.target.value)) })}
                className={inputClass}
                placeholder="원금 기준, 없으면 0"
                step="100"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium pointer-events-none">만원</span>
            </div>
            {data.debtPrincipalPaid && data.debtPrincipalPaid > 0 && (
              <div className="mt-2 text-sm text-blue-600 font-medium">
                💰 약 {formatCurrency(data.debtPrincipalPaid)} 상환 완료
              </div>
            )}
            <p className={hintClass}>
              <span className="shrink-0">💡</span>
              <span>원금 기준, 대략적인 금액이면 충분해요. 상환 이력이 있는지 정도만 봅니다.</span>
            </p>
          </div>

          {/* 13. 월 상환액 - 조건부 필수 */}
          <div>
            <label className={labelClass}>
              <DollarSign className="w-4 h-4 inline mr-1" />
              매달 대출 상환으로 나가는 금액은 얼마인가요? <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={data.monthlyDebtPayment ? wonToManwon(data.monthlyDebtPayment) : ''}
                onChange={(e) => updateData({ monthlyDebtPayment: manwonToWon(Number(e.target.value)) })}
                className={inputClass}
                placeholder="예: 100 (100만원), 없으면 0"
                step="10"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium pointer-events-none">만원</span>
            </div>
            {data.monthlyDebtPayment && data.monthlyDebtPayment > 0 && (
              <div className="mt-2 space-y-1">
                <div className="text-sm text-orange-600 font-semibold">
                  💰 월 {wonToManwon(data.monthlyDebtPayment)}만원
                </div>
                <div className="text-xs text-gray-500">
                  연간 약 {formatCurrency(data.monthlyDebtPayment * 12)}
                </div>
              </div>
            )}
            <p className={hintClass}>
              <span className="shrink-0">⚠️</span>
              <span><strong>여러 대출이 있다면 모두 합산해주세요.</strong> 이 금액은 사실상 '고정 생활비'로 보기 때문에 청약 납입 여력과 직결돼요.</span>
            </p>
          </div>

          {/* 요약 카드 */}
          {data.debtPrincipal && data.monthlyDebtPayment && (
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                부채 요약
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">대출 종류</span>
                  <span className="font-semibold text-gray-800">
                    {data.debtType === 'housing' ? '주택 관련' : 
                     data.debtType === 'student' ? '학자금/신용' : 
                     data.debtType === 'mixed' ? '여러 종류' : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">남은 원금</span>
                  <span className="font-semibold text-orange-700">
                    {formatCurrency(data.debtPrincipal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">월 상환액</span>
                  <span className="font-semibold text-red-700">
                    {wonToManwon(data.monthlyDebtPayment)}만원
                  </span>
                </div>
                {data.debtInterestRateBand && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">이자율</span>
                    <span className="font-semibold text-gray-800">
                      {data.debtInterestRateBand === 'LT_2' ? '2% 이하' :
                       data.debtInterestRateBand === 'BETWEEN_2_4' ? '2~4%' :
                       data.debtInterestRateBand === 'BETWEEN_4_6' ? '4~6%' :
                       data.debtInterestRateBand === 'GT_6' ? '6% 이상' : '잘 모름'}
                    </span>
                  </div>
                )}
                {data.debtPrincipalPaid && data.debtPrincipalPaid > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">상환 완료</span>
                    <span className="font-semibold text-green-700">
                      {formatCurrency(data.debtPrincipalPaid)}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-orange-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">예상 완납 기간</span>
                    <span className="font-bold text-lg text-orange-700">
                      약 {Math.ceil(data.debtPrincipal / (data.monthlyDebtPayment * 12))}년
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    * 원금만 계산, 이자 미포함
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 대출 없을 때 안내 */}
      {data.hasDebt === false && (
        <div className="bg-green-50 p-8 rounded-xl border border-green-200 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-green-800 mb-2">훌륭해요!</h3>
          <p className="text-green-700">
            부채가 없다는 것은 청약 준비에 큰 강점이 됩니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default Step4Debt;