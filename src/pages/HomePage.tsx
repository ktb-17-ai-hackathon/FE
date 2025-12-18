import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Calendar,
  TrendingUp,
  Bell,
  ChevronRight,
  PiggyBank,
} from 'lucide-react';

import { loadCheongyakScoreFromStorage } from '../utils/cheongyakScore';
import hamaLogo from '../assets/hama.png';

type LatestScore = ReturnType<typeof loadCheongyakScoreFromStorage>;

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // ✅ 초기 빈칸 허용
  const [subscriptionMonths, setSubscriptionMonths] = useState<number | ''>('');

  // ✅ 버튼 눌러서 "확인" 했는지 여부
  const [checkedSubscription, setCheckedSubscription] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);

  const [latestScore, setLatestScore] = useState<LatestScore>(null);

  useEffect(() => {
    setLatestScore(loadCheongyakScoreFromStorage(null));
  }, []);

  const handleStartSurvey = () => {
    navigate('/survey');
  };

  const scoreText = latestScore ? `${latestScore.total}점` : '설문 필요';

  const unhousedText =
    latestScore && latestScore.debug.unhousedYears > 0
      ? `${latestScore.debug.unhousedYears}년`
      : '설문 필요';

  // ✅ "연속 납입 조건 충족 확인" 버튼 동작
  const handleCheckSubscription = () => {
    setCheckedSubscription(true);

    const months = subscriptionMonths === '' ? 0 : subscriptionMonths;

    if (months >= 6) {
      setCheckMessage('✓ 최소 가입 기간 충족');
    } else {
      setCheckMessage('✗ 아직 최소 가입 기간(6개월) 미충족입니다.');
    }
  };

  const monthsForView = subscriptionMonths === '' ? 0 : subscriptionMonths;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* ✅ 로고 + 타이틀 */}
          <div className="flex items-center gap-3">
            <img
              src={hamaLogo}
              alt="청약하마 로고"
              className="w-24 h-24 object-contain"
            />
            <h1 className="text-3xl font-bold text-gray-900">내집하마</h1>
          </div>

          <p className="mt-2 text-gray-600">
            3분이면 충분해요. 정확한 설계를 위해 정보를 입력해주세요.
          </p>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. AI 설계 받아보기 */}
          <div
            className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer"
            onClick={handleStartSurvey}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

            <div className="relative">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-bold mb-3">나만의 청약·주거 설계</h2>
              <p className="text-blue-100 mb-6 text-sm leading-relaxed">
                3분이면 완료! AI가 당신의 생애주기를 분석하고
                <br />
                맞춤형 청약 전략을 제시해드려요.
              </p>

              <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-50 transition-all group-hover:gap-3">
                AI 설계 받아보기
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. 청약통장 납입 체크 */}
          <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
              <PiggyBank className="w-8 h-8 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              청약통장 납입 현황
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              연속 납입 개월 수를 체크하고 관리하세요
            </p>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  연속 납입 개월 수
                </label>
                <input
                  type="number"
                  value={subscriptionMonths}
                  onChange={(e) => {
                    const v = e.target.value;

                    // ✅ 빈칸 허용
                    setSubscriptionMonths(v === '' ? '' : Number(v));

                    // ✅ 값 바뀌면 "확인 상태" 초기화 (버튼 다시 누르게)
                    setCheckedSubscription(false);
                    setCheckMessage(null);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-semibold"
                  placeholder="예: 6"
                  min="0"
                />
              </div>

              {/* ✅ 이제 "입력값이 있을 때만" 카드 표시 */}
              {subscriptionMonths !== '' && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-900 font-medium mb-1">
                    현재 납입 기간
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {monthsForView}개월
                  </p>

                  {/* ✅ 버튼 눌렀을 때만 표시 */}
                  {checkedSubscription && checkMessage && (
                    <p
                      className={`text-xs mt-2 ${
                        monthsForView >= 6 ? 'text-blue-700' : 'text-red-600'
                      }`}
                    >
                      {checkMessage}
                    </p>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleCheckSubscription}
                className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-all"
              >
                연속 납입 조건 충족 확인
              </button>
            </div>
          </div>

          {/* 3. 내 청약 현황 */}
          <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              나의 청약 경쟁력
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              현재 내 청약 현황을 한눈에 확인하세요
            </p>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-700 font-medium">무주택 기간</span>
                <span className="text-xl font-bold text-gray-900">
                  {unhousedText}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-700 font-medium">청약 가점</span>
                <span className="text-xl font-bold text-gray-900">
                  {scoreText}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-700 font-medium">청약 순위</span>
                <span className="text-xl font-bold text-gray-900">-</span>
              </div>

              {latestScore && (
                <div className="mt-2 text-xs text-gray-500">
                  {latestScore.note}
                </div>
              )}
            </div>

            <button className="w-full mt-4 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
              상세 정보 입력하기
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* 4. 실시간 청약 일정 */}
          <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-purple-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              이달의 청약 일정
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              놓치지 말아야 할 청약 공고를 확인하세요
            </p>

            <div className="space-y-3">
              <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-gray-900">강남구 OO아파트</p>
                    <p className="text-sm text-gray-600">민영주택 일반공급</p>
                  </div>
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                    D-5
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>2025-01-15</span>
                </div>
              </div>

              <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-gray-900">분당구 XX아파트</p>
                    <p className="text-sm text-gray-600">공공분양 특별공급</p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
                    D-12
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>2025-01-22</span>
                </div>
              </div>
            </div>

            <button className="w-full mt-4 bg-purple-500 text-white py-3 rounded-xl font-semibold hover:bg-purple-600 transition-all flex items-center justify-center gap-2">
              전체 일정 보기
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-lg p-6 text-center">
          <p className="text-gray-600">
            💡 <strong className="text-gray-900">청약Assist</strong>는 AI 기반
            분석을 통해<br className="sm:hidden" />
            당신에게 맞는 최적의 청약 전략을 제시합니다.
          </p>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
