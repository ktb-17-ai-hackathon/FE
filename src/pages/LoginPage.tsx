// LoginPage.tsx
import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { api } from "../types";
import hamaLogo from '../assets/hama.png'; // ✅ 추가

type LocationState = { from?: string };

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as LocationState)?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.trim().length > 0;
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;

    try {
      setLoading(true);
      setError(null);

      const res = await api.login({ email, password });

      localStorage.setItem("loginUser", JSON.stringify(res.data));
      localStorage.removeItem("cheongyakScore:v1:latest");

      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* ✅ 헤더 - 하마 로고 추가 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src={hamaLogo}
              alt="청약하마 로고"
              className="w-24 h-24 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">내집하마</h1>
          <p className="text-gray-600">로그인 후 설문을 진행할 수 있어요</p>
        </div>

        {/* 카드 */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">로그인</h2>
            <p className="text-gray-500 text-sm mt-1">
              계정이 없으신가요?{" "}
              <Link
                to="/signup"
                className="text-blue-600 font-semibold hover:underline"
              >
                회원가입
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이메일 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                이메일
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  value={email}
                  onChange={(e) => {
                    setError(null);
                    setEmail(e.target.value);
                  }}
                  type="email"
                  autoComplete="email"
                  placeholder="example@email.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  value={password}
                  onChange={(e) => {
                    setError(null);
                    setPassword(e.target.value);
                  }}
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="비밀번호를 입력하세요"
                  className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-50"
                  aria-label="toggle password"
                >
                  {showPw ? (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg ${
                !canSubmit || loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              }`}
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  로그인 중...
                </>
              ) : (
                <>
                  로그인 <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-sm text-gray-500">
              로그인하면 설문조사를 진행할 수 있습니다.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;