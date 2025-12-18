import React from 'react';
import { Home, MapPin, Users, Calendar, Building } from 'lucide-react';
import type { SurveyCreateRequest } from '../../types/survey.types';

interface Props {
  data: SurveyCreateRequest;
  updateData: (data: Partial<SurveyCreateRequest>) => void;
}

const Step2Housing: React.FC<Props> = ({ data, updateData }) => {
  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none bg-blue-50 focus:bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";
  const hintClass = "text-xs text-gray-500 mt-1.5 flex items-start gap-1";

  // 집 소유 상태를 추적하기 위한 로컬 상태
  const [houseOwnershipStatus, setHouseOwnershipStatus] = React.useState<
    'never' | 'past' | 'current' | null
  >(null);

  /**
   * ✅ 세대주 선택 UI 버그 해결용 로컬 상태
   * - data.isHouseholder는 boolean|null 이라서 (부모님/배우자) 둘 다 false로 동일
   * - 그래서 "어느 버튼을 눌렀는지"는 로컬로 따로 기억해서 UI 선택을 1개만 보이게 함
   */
  const [householderChoice, setHouseholderChoice] = React.useState<
    'self' | 'parents' | 'spouse' | 'unknown' | null
  >(null);

  // 초기화: data.hasOwnedHouse에서 상태 복원
  React.useEffect(() => {
    if (data.hasOwnedHouse === false) {
      setHouseOwnershipStatus('never');
    } else if (data.hasOwnedHouse === true && data.unhousedStartYear) {
      setHouseOwnershipStatus('past');
    } else if (data.hasOwnedHouse === true) {
      setHouseOwnershipStatus('current');
    }
  }, [data.hasOwnedHouse, data.unhousedStartYear]);

  // ✅ 초기화: data.isHouseholder에서 세대주 선택 UI 복원(가능한 범위에서)
  React.useEffect(() => {
    if (data.isHouseholder === true) {
      setHouseholderChoice('self');
      return;
    }
    if (data.isHouseholder === null) {
      setHouseholderChoice('unknown');
      return;
    }
    if (data.isHouseholder === false) {
      // data만으로는 'parents' vs 'spouse' 구분 불가 → 기본값을 parents로 둠
      // (한 번 선택한 값까지 영구 보존하려면 별도 필드 저장 필요)
      setHouseholderChoice((prev) => prev ?? 'parents');
    }
  }, [data.isHouseholder]);

  const handleHouseOwnership = (status: 'never' | 'past' | 'current') => {
    setHouseOwnershipStatus(status);

    if (status === 'never') {
      updateData({
        hasOwnedHouse: false,
        unhousedStartYear: undefined,
      });
    } else if (status === 'past') {
      updateData({
        hasOwnedHouse: true,
      });
    } else if (status === 'current') {
      updateData({
        hasOwnedHouse: true,
        unhousedStartYear: undefined,
      });
    }
  };

  const handleHouseholderSelect = (choice: 'self' | 'parents' | 'spouse' | 'unknown') => {
    setHouseholderChoice(choice);

    if (choice === 'self') {
      updateData({ isHouseholder: true });
    } else if (choice === 'unknown') {
      updateData({ isHouseholder: null });
    } else {
      // parents / spouse 는 서버에는 둘 다 false로 저장(기존 스키마 유지)
      updateData({ isHouseholder: false });
    }
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center pb-6 border-b">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
          <Home className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">현재 살고 있는 집</h2>
        <p className="text-gray-600">지금 어디서, 어떤 상태로 살고 있나요?</p>
      </div>

      {/* 현재 거주지 - 필수 */}
      <div>
        <label className={labelClass}>
          <MapPin className="w-4 h-4 inline mr-1" />
          지금 거주지가 어디이신가요? <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.currentDistrict || ''}
          onChange={(e) => updateData({ currentDistrict: e.target.value })}
          className={inputClass}
          placeholder="예: 송파구, 하남시"
          required
        />
        <p className={hintClass}>
          <span className="shrink-0">💡</span>
          <span>구 또는 시 단위로 입력해주세요.</span>
        </p>
      </div>

      {/* 세대주 여부 - 필수 */}
      <div>
        <label className={labelClass}>
          <Users className="w-4 h-4 inline mr-1" />
          지금 살고 있는 집에서 행정적으로 '집 대표'로 등록된 사람은 누구인가요?{' '}
          <span className="text-red-500">*</span>
        </label>

        <div className="space-y-2">
          {[
            { label: '나', choice: 'self' as const, desc: '본인이 세대주입니다' },
            { label: '부모님', choice: 'parents' as const, desc: '부모님이 세대주입니다' },
            { label: '배우자', choice: 'spouse' as const, desc: '배우자가 세대주입니다' },
            { label: '잘 모르겠어요', choice: 'unknown' as const, desc: '확인이 필요합니다' },
          ].map((option) => {
            const isSelected = householderChoice === option.choice;

            return (
              <button
                key={option.label}
                type="button"
                onClick={() => handleHouseholderSelect(option.choice)}
                className={`
                  w-full py-3 px-4 rounded-xl text-left transition-all
                  ${isSelected
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                <div className="font-medium">{option.label}</div>
                <div className={`text-xs mt-0.5 ${isSelected ? 'text-green-100' : 'text-gray-500'}`}>
                  {option.desc}
                </div>
              </button>
            );
          })}
        </div>

        <p className={hintClass}>
          <span className="shrink-0">💡</span>
          <span>
            <strong>쉽게 설명하면</strong> "이 집의 공식 대표가 누구냐"는 질문이에요. 청약은 개인이
            아니라 '집 단위'로 판단하기 때문에 이 정보가 꼭 필요해요.
          </span>
        </p>
      </div>

      {/* 집 소유 이력 - 필수 */}
      <div>
        <label className={labelClass}>
          <Building className="w-4 h-4 inline mr-1" />
          지금까지 본인 명의로 집을 가진 적이 있나요? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '한 번도 없어요', status: 'never' as const },
            { label: '예전에 있었어요', status: 'past' as const },
            { label: '지금도 있어요', status: 'current' as const },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => handleHouseOwnership(option.status)}
              className={`
                py-3 px-2 rounded-xl font-medium transition-all text-sm
                ${houseOwnershipStatus === option.status
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className={hintClass}>
          <span className="shrink-0">💡</span>
          <span>
            <strong>왜 중요할까요?</strong> '집을 한 번도 안 가져본 사람'에게만 주어지는 청약 기회가 있어요.
          </span>
        </p>
      </div>

      {/* 조건부: 예전에 집이 있었고 30세 이상일 때 - 처분 시기 */}
      {houseOwnershipStatus === 'past' && data.age && data.age >= 30 && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">
              무주택 기간 계산
            </span>
            <span className="text-blue-700 text-xs">선택 사항</span>
          </div>
          <label className={labelClass}>
            <Calendar className="w-4 h-4 inline mr-1" />
            마지막으로 집을 처분한 시기는 언제쯤인가요?
          </label>
          <input
            type="number"
            value={data.unhousedStartYear || ''}
            onChange={(e) => updateData({ unhousedStartYear: Number(e.target.value) })}
            className={inputClass}
            placeholder="예: 2019"
            min="1980"
            max={new Date().getFullYear()}
          />
          <p className={hintClass}>
            <span className="shrink-0">💡</span>
            <span>
              <strong>무주택 기간 계산용</strong> 오래 집이 없을수록 유리한 경우가 많아요.
            </span>
          </p>
        </div>
      )}

      {/* 부모님 부양 여부 - 현재 */}
      <div>
        <label className={labelClass}>
          현재 만 60세 이상인 부모님을 3년 이상 생활비나 주거로 도와드리고 있나요?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateData({ isSupportingParents: true })}
            className={`
              py-3 rounded-xl font-medium transition-all
              ${data.isSupportingParents === true
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
          >
            네
          </button>
          <button
            type="button"
            onClick={() => updateData({ isSupportingParents: false })}
            className={`
              py-3 rounded-xl font-medium transition-all
              ${data.isSupportingParents === false
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
          >
            아니요
          </button>
        </div>
        <p className={hintClass}>
          <span className="shrink-0">💡</span>
          <span>이 질문은 소수에게만 해당되지만 해당되면 청약에서 큰 혜택이 생길 수 있어요.</span>
        </p>
      </div>

      {/* 미래 부모님 부양 계획 */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-bold rounded">
            미래 계획
          </span>
          <span className="text-purple-700 text-xs">선택 사항</span>
        </div>
        <label className={labelClass}>
          앞으로 부모님이 연로해지면 함께 살거나 생활을 책임질 계획이 있나요?
        </label>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <button
            type="button"
            onClick={() => updateData({ fIsSupportingParents: true })}
            className={`
              py-3 rounded-xl font-medium transition-all
              ${data.fIsSupportingParents === true
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'}
            `}
          >
            네
          </button>
          <button
            type="button"
            onClick={() => updateData({ fIsSupportingParents: false })}
            className={`
              py-3 rounded-xl font-medium transition-all
              ${data.fIsSupportingParents === false
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'}
            `}
          >
            아니요
          </button>
        </div>
        <p className={hintClass}>
          <span className="shrink-0">💡</span>
          <span>미래 선택지 설명을 위한 참고용 질문이에요.</span>
        </p>
      </div>
    </div>
  );
};

export default Step2Housing;
