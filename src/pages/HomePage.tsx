import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  
  TrendingUp,
  ChevronRight,
  PiggyBank,
  BarChart3, // ✅ 추가
} from 'lucide-react';

import { loadCheongyakScoreFromStorage } from '../utils/cheongyakScore';
import hamaLogo from '../assets/hama.png';

type LatestScore = ReturnType<typeof loadCheongyakScoreFromStorage>;

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [subscriptionMonths, setSubscriptionMonths] = useState<number | ''>('');
  const [checkedSubscription, setCheckedSubscription] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);

  const [latestScore, setLatestScore] = useState<LatestScore>(null);

  useEffect(() => {
    setLatestScore(loadCheongyakScoreFromStorage(null));
  }, []);

  const handleStartSurvey = () => {
    navigate('/survey');
  };

  // ✅ 최근 surveyId 가져오기
  const latestSurveyId = latestScore?.surveyId;

  // ✅ 분석 결과 보기
  const handleViewReport = () => {
    if (latestSurveyId) {
      navigate(`/plan/${latestSurveyId}`);
    } else {
      alert('아직 분석 결과가 없습니다. 먼저 설문을 완료해주세요.');
    }
  };

  const scoreText = latestScore ? `${latestScore.total}점` : '설문 필요';

  const unhousedText =
    latestScore && latestScore.debug.unhousedYears > 0
      ? `${latestScore.debug.unhousedYears}년`
      : '설문 필요';

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
                    setSubscriptionMonths(v === '' ? '' : Number(v));
                    setCheckedSubscription(false);
                    setCheckMessage(null);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-semibold"
                  placeholder="예: 6"
                  min="0"
                />
              </div>

              {subscriptionMonths !== '' && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-900 font-medium mb-1">
                    현재 납입 기간
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {monthsForView}개월
                  </p>

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

              

              {latestScore && (
                <div className="mt-2 text-xs text-gray-500">
                  {latestScore.note}
                </div>
              )}
            </div>

            
          </div>

          {/* ✅ 4. 내 분석 결과 보기 */}
          <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-indigo-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              내 분석 결과
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              AI가 분석한 나만의 청약 전략 리포트를 확인하세요
            </p>

            {latestSurveyId ? (
              <div className="space-y-3">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm text-indigo-700 font-medium">
                        최근 분석 결과
                      </p>
                      <p className="text-xs text-indigo-600 mt-1">
                        Survey
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleViewReport}
                  className="w-full bg-indigo-500 text-white py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                >
                  리포트 확인하기
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-gray-600 text-sm">
                    아직 분석 결과가 없습니다
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    먼저 설문을 완료해주세요
                  </p>
                </div>

                <button
                  onClick={handleStartSurvey}
                  className="w-full bg-gray-300 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-400 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  설문 시작하기
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-lg p-6 text-center">
          <p className="text-gray-600">
            💡 <strong className="text-gray-900">내집하마</strong>는 AI 기반
            분석을 통해<br className="sm:hidden" />
            당신에게 맞는 최적의 청약 전략을 제시합니다.
          </p>
        </div>
      </main>
    </div>
  );
};

export default HomePage;