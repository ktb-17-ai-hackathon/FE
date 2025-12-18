import React, { useState } from 'react';
import { DollarSign, Briefcase, PiggyBank, TrendingUp, Wallet, Package } from 'lucide-react';
import type { SurveyCreateRequest } from '../../types/survey.types';

interface Props {
  data: SurveyCreateRequest;
  updateData: (data: Partial<SurveyCreateRequest>) => void;
}

const Step3Income: React.FC<Props> = ({ data, updateData }) => {
  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none bg-blue-50 focus:bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";
  const hintClass = "text-xs text-gray-500 mt-1.5 flex items-start gap-1";

  // 추가 자산 상태
  const [additionalAssetInputs, setAdditionalAssetInputs] = useState({
    stocks: 0,
    car: 0,
    parentHelp: 0,
    other: 0
  });

  // 천만원 단위로 표시하는 헬퍼
  const formatCurrency = (value: number) => {
    if (value >= 100000000) {
      return (value / 100000000).toFixed(1) + '억원';
    }
    return (value / 10000000).toFixed(1) + '천만원';
  };

  // 추가 자산 합산
  const calculateAdditionalAssets = () => {
    const total = additionalAssetInputs.stocks + 
                  additionalAssetInputs.car + 
                  additionalAssetInputs.parentHelp + 
                  additionalAssetInputs.other;
    updateData({ additionalAssets: total });
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center pb-6 border-b">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
          <DollarSign className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">돈 흐름</h2>
        <p className="text-gray-600">얼마나 벌고, 얼마나 모으고 있나요?</p>
      </div>

      {/* 1. 직업 */}
      <div>
        <label className={labelClass}>
          <Briefcase className="w-4 h-4 inline mr-1" />
          현재 직업(또는 준비 중인 직업)은 무엇인가요?
        </label>
        <input
          type="text"
          value={data.jobTitle || ''}
          onChange={(e) => updateData({ jobTitle: e.target.value })}
          className={inputClass}
          placeholder="예: 개발자, 공무원, 대학생"
        />
        <p className={hintClass}>
          <span className="shrink-0">💡</span>
          <span>미래 소득을 가늠하기 위한 참고용이에요.</span>
        </p>
      </div>

      {/* 2. 직장 위치 */}
      <div>
        <label className={labelClass}>
          <Briefcase className="w-4 h-4 inline mr-1" />
          현재 직장 위치(또는 희망하는 직장 위치)는 어디인가요?
        </label>
        <input
          type="text"
          value={data.jobDistrict || ''}
          onChange={(e) => updateData({ jobDistrict: e.target.value })}
          className={inputClass}
          placeholder="예: 강남구, 판교"
        />
      </div>

      {/* 3. 연 소득 */}
      <div>
        <label className={labelClass}>
          <TrendingUp className="w-4 h-4 inline mr-1" />
          현재 주수입 기준, 연 소득은 어느 정도인가요?
        </label>
        <input
          type="number"
          value={data.annualIncome || ''}
          onChange={(e) => updateData({ annualIncome: Number(e.target.value) })}
          className={inputClass}
          placeholder="예: 50000000 (5천만원)"
          step="1000000"
        />
        {data.annualIncome && data.annualIncome > 0 && (
          <div className="mt-2 text-sm text-blue-600 font-medium">
            약 {formatCurrency(data.annualIncome)}
          </div>
        )}
        <p className={hintClass}>
          <span className="shrink-0">💡</span>
          <span>현재 직장이 없다면 넘어가주세요. 아르바이트는 부수입에 작성해주시면 됩니다 :)</span>
        </p>
      </div>

      {/* 4. 부수입 */}
      <div>
        <label className={labelClass}>
          부수입은 연평균 어느 정도인가요?
        </label>
        <input
          type="number"
          value={data.annualSideIncome || ''}
          onChange={(e) => updateData({ annualSideIncome: Number(e.target.value) })}
          className={inputClass}
          placeholder="없으면 0"
          step="1000000"
        />
        {data.annualSideIncome && data.annualSideIncome > 0 && (
          <div className="mt-2 text-sm text-emerald-600 font-medium">
            약 {formatCurrency(data.annualSideIncome)}
          </div>
        )}
      </div>

      {/* 5. 월 저축액 */}
      <div>
        <label className={labelClass}>
          <PiggyBank className="w-4 h-4 inline mr-1" />
          매달 얼마 정도 저축하고 있나요?
        </label>
        <input
          type="number"
          value={data.monthlySavingAmount || ''}
          onChange={(e) => updateData({ monthlySavingAmount: Number(e.target.value) })}
          className={inputClass}
          placeholder="예: 1000000 (100만원), 없으면 0"
          step="100000"
        />
        {data.monthlySavingAmount && data.monthlySavingAmount > 0 && (
          <div className="mt-2 text-sm text-emerald-600 font-medium">
            월 {(data.monthlySavingAmount / 10000).toFixed(0)}만원 → 연간 약 {((data.monthlySavingAmount * 12) / 10000000).toFixed(1)}천만원
          </div>
        )}
      </div>

      {/* 6. 현재 모아둔 돈 - 필수 */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
        <label className={labelClass}>
          <Wallet className="w-4 h-4 inline mr-1" />
          지금까지 모아둔 현금·예금은 총 얼마인가요? <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={data.currentFinancialAssets || ''}
          onChange={(e) => updateData({ currentFinancialAssets: Number(e.target.value) })}
          className={inputClass}
          placeholder="예: 100000000 (1억), 없으면 0"
          step="10000000"
          required
        />
        {data.currentFinancialAssets && data.currentFinancialAssets > 0 && (
          <div className="mt-2 text-sm text-blue-700 font-semibold">
            약 {formatCurrency(data.currentFinancialAssets)}
          </div>
        )}
        <p className={hintClass}>
          <span className="shrink-0">💡</span>
          <span>만약 빠르게 청약에 당첨됐을 경우, 계약금을 납부할 수 있는지 파악하기 위한 질문이에요.</span>
        </p>
      </div>

      {/* 7. 추가 자산 (복수 입력) */}
      <div>
        <label className={labelClass}>
          <Package className="w-4 h-4 inline mr-1" />
          추가로 활용 가능한 자산이 있나요?
        </label>
        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">주식/코인</label>
            <input
              type="number"
              value={additionalAssetInputs.stocks || ''}
              onChange={(e) => setAdditionalAssetInputs(prev => ({ ...prev, stocks: Number(e.target.value) }))}
              placeholder="없으면 0"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              step="1000000"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">자동차 (매각 가능 시)</label>
            <input
              type="number"
              value={additionalAssetInputs.car || ''}
              onChange={(e) => setAdditionalAssetInputs(prev => ({ ...prev, car: Number(e.target.value) }))}
              placeholder="없으면 0"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              step="1000000"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">부모님 도움 가능 금액</label>
            <input
              type="number"
              value={additionalAssetInputs.parentHelp || ''}
              onChange={(e) => setAdditionalAssetInputs(prev => ({ ...prev, parentHelp: Number(e.target.value) }))}
              placeholder="없으면 0"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              step="5000000"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">기타</label>
            <input
              type="number"
              value={additionalAssetInputs.other || ''}
              onChange={(e) => setAdditionalAssetInputs(prev => ({ ...prev, other: Number(e.target.value) }))}
              placeholder="없으면 0"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              step="1000000"
            />
          </div>
          <div className="pt-2 border-t">
            <button
              type="button"
              onClick={calculateAdditionalAssets}
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
            >
              합계 계산하기
            </button>
            {data.additionalAssets && data.additionalAssets > 0 && (
              <div className="mt-3 text-center text-sm font-semibold text-blue-700">
                총 추가 자산: {formatCurrency(data.additionalAssets)}
              </div>
            )}
          </div>
        </div>
        <p className={hintClass}>
          <span className="shrink-0">💡</span>
          <span>당장 쓰지 않아도, '선택지'로 고려하기 위한 정보예요.</span>
        </p>
      </div>

      {/* 8. 목표 저축률 */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-bold rounded">미래 계획</span>
          <span className="text-purple-700 text-xs">선택 사항</span>
        </div>
        <label className={labelClass}>
          직장을 다니게 되거나 유지된다면 월급의 몇 %를 저축할 생각인가요?
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={data.targetSavingRate || ''}
            onChange={(e) => updateData({ targetSavingRate: Number(e.target.value) })}
            className={inputClass}
            placeholder="예: 40"
            min="0"
            max="100"
          />
          <span className="text-lg font-bold text-purple-700">%</span>
        </div>
        <p className={hintClass}>
          <span className="shrink-0">💡</span>
          <span>미래 자산 증가 속도 예측용 질문이에요.</span>
        </p>
      </div>
    </div>
  );
};

export default Step3Income;