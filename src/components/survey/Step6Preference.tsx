import React from 'react';
import { Home, MapPin, Heart, Layers, Star } from 'lucide-react';
import type { SurveyCreateRequest, PriorityCriteria } from '../../types/survey.types';

interface Props {
  data: SurveyCreateRequest;
  updateData: (data: Partial<SurveyCreateRequest>) => void;
}

const Step6Preference: React.FC<Props> = ({ data, updateData }) => {
  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none bg-blue-50 focus:bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";
  const hintClass = "text-xs text-gray-500 mt-1.5 flex items-start gap-1";

  // 우선순위 토글
  const togglePriority = (criterion: PriorityCriteria) => {
    const current = data.priorityCriteria || [];
    const updated = current.includes(criterion)
      ? current.filter(c => c !== criterion)
      : [...current, criterion];
    updateData({ priorityCriteria: updated });
  };

  const isPrioritySelected = (criterion: PriorityCriteria) => {
    return data.priorityCriteria?.includes(criterion) || false;
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center pb-6 border-b">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">살고 싶은 집</h2>
        <p className="text-gray-600">취향과 목표를 알려주세요</p>
      </div>

      {/* 1. 청약 유형 - 필수 */}
      <div>
        <label className={labelClass}>
          <Home className="w-4 h-4 inline mr-1" />
          청약을 통해 어떤 유형의 집을 노려보고 싶나요? <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {[
            { 
              value: 'public', 
              label: '공공분양', 
              desc: '소득·자산 기준이 있지만 가격이 저렴하고 당첨 확률이 높아요',
              icon: '🏛️'
            },
            { 
              value: 'private', 
              label: '민영분양', 
              desc: '시세에 가깝지만 입지가 좋고 브랜드가 있어요',
              icon: '🏢'
            },
            { 
              value: 'both', 
              label: '둘 다 해볼게요', 
              desc: '기회가 되는 대로 모두 도전하고 싶어요',
              icon: '🎯'
            }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateData({ targetSubscriptionType: option.value as any })}
              className={`
                w-full p-4 rounded-xl text-left transition-all border-2
                ${data.targetSubscriptionType === option.value
                  ? 'bg-pink-600 text-white border-pink-600 shadow-lg'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1">
                  <div className="font-bold text-lg mb-1">{option.label}</div>
                  <div className={`text-sm ${data.targetSubscriptionType === option.value ? 'text-pink-100' : 'text-gray-500'}`}>
                    {option.desc}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. 선호 지역 - 필수 */}
      <div>
        <label className={labelClass}>
          <MapPin className="w-4 h-4 inline mr-1" />
          살고 싶은 지역은 어디인가요? <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.preferredRegion || ''}
          onChange={(e) => updateData({ preferredRegion: e.target.value })}
          className={inputClass}
          placeholder="예: 송파구, 하남시, 수원"
          required
        />
        <p className={hintClass}>
          <span className="shrink-0">💡</span>
          <span>구 또는 시 단위로 입력해주세요. 구체적으로 적을수록 더 정확한 분석이 가능합니다. 여러 곳을 고려 중이라면 쉼표로 구분해주세요.</span>
        </p>
      </div>

      {/* 3. 중요 요소 (복수 선택) */}
      <div>
        <label className={labelClass}>
          <Star className="w-4 h-4 inline mr-1" />
          집을 고를 때 가장 중요한 요소는 무엇인가요? <span className="text-gray-500">(복수 선택)</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'transport', label: '교통', icon: '🚇', desc: '지하철·버스 접근성' },
            { value: 'commute', label: '직장과 거리', icon: '💼', desc: '출퇴근 시간' },
            { value: 'school', label: '학군', icon: '📚', desc: '교육 환경' },
            { value: 'commercial', label: '상권', icon: '🛒', desc: '쇼핑·편의시설' },
            { value: 'price', label: '가격', icon: '💰', desc: '집값·대출 부담' },
            { value: 'park', label: '공원', icon: '🌳', desc: '자연환경' },
            { value: 'view', label: '뷰', icon: '🌆', desc: '조망권' },
            { value: 'other', label: '기타', icon: '✨', desc: '그 외 요소' }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => togglePriority(option.value as PriorityCriteria)}
              className={`
                p-3 rounded-xl text-left transition-all border-2
                ${isPrioritySelected(option.value as PriorityCriteria)
                  ? 'bg-pink-600 text-white border-pink-600 shadow-lg'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{option.icon}</span>
                <span className="font-bold">{option.label}</span>
              </div>
              <div className={`text-xs ${isPrioritySelected(option.value as PriorityCriteria) ? 'text-pink-100' : 'text-gray-500'}`}>
                {option.desc}
              </div>
            </button>
          ))}
        </div>
        {data.priorityCriteria && data.priorityCriteria.length > 0 && (
          <div className="mt-3 p-3 bg-pink-50 rounded-lg border border-pink-200">
            <div className="text-sm text-pink-800">
              <span className="font-semibold">선택된 요소:</span> {data.priorityCriteria.length}개
            </div>
          </div>
        )}
      </div>

      {/* 4. 선호 평수 - 필수 */}
      <div>
        <label className={labelClass}>
          <Layers className="w-4 h-4 inline mr-1" />
          선호하는 집 크기는 어느 정도인가요? <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {[
            { 
              value: '20평대 초반', 
              area: '49~50㎡', 
              family: '1~2인',
              desc: '소형, 흔히 말하는 소형이에요'
            },
            { 
              value: '25평 내외', 
              area: '59㎡', 
              family: '2~3인',
              desc: '중소형, 저출산·비혼 등으로 요즘 수요가 커지고 있어요'
            },
            { 
              value: '34평 내외', 
              area: '84㎡', 
              family: '3~4인',
              desc: '국민 평형, 전통적인 국민 평형으로 많이 언급돼요'
            },
            { 
              value: '43평 내외', 
              area: '114㎡', 
              family: '4인 이상',
              desc: '중대형, 넓은 공간이 필요한 가구'
            },
            { 
              value: '50평대', 
              area: '165㎡+', 
              family: '4인 이상',
              desc: '대형, 여유로운 공간'
            },
            { 
              value: '그 이상', 
              area: '165㎡++', 
              family: '대가족',
              desc: '초대형'
            }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateData({ preferredHousingSize: option.value })}
              className={`
                w-full p-4 rounded-xl text-left transition-all border-2
                ${data.preferredHousingSize === option.value
                  ? 'bg-pink-600 text-white border-pink-600 shadow-lg'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-bold text-lg mb-1">{option.value}</div>
                  <div className={`text-sm ${data.preferredHousingSize === option.value ? 'text-pink-100' : 'text-gray-500'}`}>
                    전용면적 {option.area} · {option.family} 가구
                  </div>
                  <div className={`text-xs mt-1 ${data.preferredHousingSize === option.value ? 'text-pink-200' : 'text-gray-400'}`}>
                    {option.desc}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
        <p className={hintClass}>
          <span className="shrink-0">💡</span>
          <span>평균 가구수는 평수별로 크기를 가늠하기 위한 가이드일 뿐이에요. 원하는 평수가 있다면 몇 인용으로 설명돼 있든, 취향대로 평수를 선택해주세요.</span>
        </p>
      </div>

      {/* 완료 안내 */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-xl border border-pink-200">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-600" />
          거의 다 왔어요!
        </h3>
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
          지금 답해주신 내용을 바탕으로<br />
          <span className="font-semibold text-pink-700">"당장 넣을 청약"</span>이 아니라<br />
          <span className="font-semibold text-purple-700">"앞으로 어떤 선택지를 준비하면 좋은지"</span>를<br />
          인생 흐름 기준으로 정리해드리고 있습니다.
        </p>
        <div className="bg-white p-4 rounded-lg">
          <div className="text-xs text-gray-600 space-y-1.5">
            <div className="flex items-start gap-2">
              <span className="shrink-0">✓</span>
              <span>현재 자산, 부채 분석</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="shrink-0">✓</span>
              <span>LTV, DTI, DSR 계산</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="shrink-0">✓</span>
              <span>규제에 따른 대출 금액 산정</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="shrink-0">✓</span>
              <span>생애최초·신혼부부 특별공급 가능성</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="shrink-0">✓</span>
              <span>주거하는 구, 직장이 있는 구 분석</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="shrink-0">✓</span>
              <span>3~5년 단위 실행 전략 및 방향성</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step6Preference;