import React from 'react';
import { User, Heart, Baby, Users } from 'lucide-react';
import type { SurveyCreateRequest } from '../../types';

interface Props {
  data: SurveyCreateRequest;
  updateData: (data: Partial<SurveyCreateRequest>) => void;
}

const Step1BasicInfo: React.FC<Props> = ({ data, updateData }) => {
  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none bg-blue-50 focus:bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";
  const hintClass = "text-xs text-gray-500 mt-1.5 flex items-start gap-1";

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center pb-6 border-b">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">지금의 나를 알아보기</h2>
        <p className="text-gray-600">기본 정보를 입력해주세요</p>
      </div>

      {/* 나이 - 필수 */}
      <div>
        <label className={labelClass}>
          지금 만 나이가 어떻게 되시나요? <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={data.age || ''}
          onChange={(e) => updateData({ age: Number(e.target.value) })}
          className={inputClass}
          placeholder="예: 32"
          min="19"
          max="100"
          required
        />
        <p className={hintClass}>
          <span className="shrink-0">💡</span>
          <span>나이에 따라 청년·신혼·일반 청약 등 가능한 선택지가 크게 달라져요.</span>
        </p>
      </div>

      {/* 결혼 상태 - 필수 */}
      <div>
        <label className={labelClass}>
          현재 결혼 상태를 알려주세요 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'single', label: '미혼', icon: Heart },
            { value: 'married', label: '기혼', icon: Heart },
            { value: 'divorced_or_widowed', label: '이혼/사별', icon: Heart }
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => updateData({ marryStatus: value as any })}
              className={`
                py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2
                ${data.marryStatus === value
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
        <p className={hintClass}>
          <span className="shrink-0">💡</span>
          <span>결혼 여부는 청약에서 가장 큰 분기점이에요. 신혼부부·생애최초 같은 기회가 달라집니다.</span>
        </p>
      </div>

      {/* 조건부: 미혼일 때 - 미래 결혼 계획 */}
      {data.marryStatus === 'single' && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">미래 계획</span>
            <span className="text-blue-700 text-xs">선택 사항</span>
          </div>
          <label className={labelClass}>앞으로 결혼할 계획이 있나요?</label>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button
              type="button"
              onClick={() => updateData({ fMarryStatus: true })}
              className={`
                py-3 rounded-xl font-medium transition-all
                ${data.fMarryStatus === true
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                }
              `}
            >
              예
            </button>
            <button
              type="button"
              onClick={() => updateData({ fMarryStatus: false })}
              className={`
                py-3 rounded-xl font-medium transition-all
                ${data.fMarryStatus === false
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                }
              `}
            >
              아니요
            </button>
          </div>
          <p className={hintClass}>
            <span className="shrink-0">💡</span>
            <span>미래 설계를 위한 질문이에요. 몇 년 뒤를 기준으로 준비할 수 있는 청약이 달라집니다.</span>
          </p>
        </div>
      )}

      {/* 자녀 수 */}
      <div>
        <label className={labelClass}>
          <Baby className="w-4 h-4 inline mr-1" />
          현재 자녀가 있나요?
        </label>
        <input
          type="number"
          value={data.childCount ?? ''}
          onChange={(e) => updateData({ childCount: Number(e.target.value) })}
          className={inputClass}
          placeholder="없으면 0"
          min="0"
          max="10"
        />
        <p className={hintClass}>
          <span className="shrink-0">💡</span>
          <span>자녀 수는 청약 점수와 특별공급 자격에 큰 영향을 줘요.</span>
        </p>
      </div>

      {/* 미래 자녀 계획 */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-bold rounded">미래 계획</span>
          <span className="text-purple-700 text-xs">선택 사항</span>
        </div>
        <label className={labelClass}>
          앞으로 자녀를 몇 명 정도 생각하고 계신가요?
        </label>
        <input
          type="number"
          value={data.fChildCount ?? ''}
          onChange={(e) => updateData({ fChildCount: Number(e.target.value) })}
          className={inputClass}
          placeholder="추가로 낳을 자녀 수 (없으면 0)"
          min="0"
          max="10"
        />
        <p className={hintClass}>
          <span className="shrink-0">💡</span>
          <span>이미 자녀가 있다면 추가로 더 낳을 자녀 수만 입력해주세요. 신혼부부·다자녀 청약은 '언제 자녀가 생기느냐'를 기준으로 전략이 달라져요.</span>
        </p>
      </div>

      {/* 맞벌이 여부 */}
      <div>
        <label className={labelClass}>
          <Users className="w-4 h-4 inline mr-1" />
          현재 또는 앞으로 배우자와 함께 벌이를 하는 구조인가요?
        </label>
        <div className="space-y-2">
          {[
            { label: '지금도 맞벌이 중이에요', value: { isDoubleIncome: true, fIsDoubleIncome: null } },
            { label: '결혼하면 맞벌이 할 예정이에요', value: { isDoubleIncome: null, fIsDoubleIncome: true } },
            { label: '한 사람만 벌고 있어요', value: { isDoubleIncome: false, fIsDoubleIncome: null } },
            { label: '한 사람만 벌 예정이에요', value: { isDoubleIncome: null, fIsDoubleIncome: false } },
            { label: '아직 모르겠어요', value: { isDoubleIncome: null, fIsDoubleIncome: null } }
          ].map((option, idx) => {
            const isSelected = 
              data.isDoubleIncome === option.value.isDoubleIncome && 
              data.fIsDoubleIncome === option.value.fIsDoubleIncome;
            
            return (
              <button
                key={idx}
                type="button"
                onClick={() => updateData(option.value)}
                className={`
                  w-full py-3 px-4 rounded-xl text-left font-medium transition-all
                  ${isSelected
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <p className={hintClass}>
          <span className="shrink-0">💡</span>
          <span>맞벌이 여부는 청약 소득 기준 통과 여부에 직접 영향을 줍니다.</span>
        </p>
      </div>

      {/* 조건부: 자녀 계획이 있을 때 - 맞벌이 유지 계획 */}
      {(data.fChildCount && data.fChildCount > 0) && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 bg-amber-600 text-white text-xs font-bold rounded">미래 계획</span>
            <span className="text-amber-700 text-xs">선택 사항</span>
          </div>
          <label className={labelClass}>
            아이를 낳은 뒤에도 맞벌이를 유지할 계획인가요?
          </label>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button
              type="button"
              onClick={() => updateData({ willContinueDoubleIncome: true })}
              className={`
                py-3 rounded-xl font-medium transition-all
                ${data.willContinueDoubleIncome === true
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                }
              `}
            >
              네
            </button>
            <button
              type="button"
              onClick={() => updateData({ willContinueDoubleIncome: false })}
              className={`
                py-3 rounded-xl font-medium transition-all
                ${data.willContinueDoubleIncome === false
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                }
              `}
            >
              아니요
            </button>
          </div>
          <p className={hintClass}>
            <span className="shrink-0">💡</span>
            <span>소득이 줄어드는 시점을 예측하면 청약 타이밍을 앞당길지 늦출지를 판단할 수 있어요.</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Step1BasicInfo;