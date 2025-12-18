// SignupPage.tsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { api } from "../types";
import hamaLogo from '../assets/hama.png'; // ✅ 추가

const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pwMismatch =
    passwordConfirm.length > 0 && password !== passwordConfirm;

  const canSubmit = useMemo(() => {
    return (
      name.trim() &&
      email.trim() &&
      password.trim() &&
      passwordConfirm.trim() &&
      password === passwordConfirm
    );
  }, [name, email, password, passwordConfirm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;

    try {
      setLoading(true);
      setError(null);

      await api.signup({ name, email, password });

      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
      setError("회원가입에 실패했습니다. 이메일 중복 여부를 확인해 주세요.");
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
          <p className="text-gray-600">회원가입 후 설문을 진행할 수 있어요</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">회원가입</h2>
            <p className="text-gray-500 text-sm mt-1">
              이미 계정이 있으신가요?{" "}
              <Link
                to="/login"
                className="text-blue-600 font-semibold hover:underline"
              >
                로그인
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이름 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                이름
              </label>
              <div className="relative">
                <User2 className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  value={name}
                  onChange={(e) => {
                    setError(null);
                    setName(e.target.value);
                  }}
                  type="text"
                  autoComplete="name"
                  placeholder="홍길동"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            </div>

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
                  autoComplete="new-password"
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

            {/* 비밀번호 확인 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                비밀번호 확인
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  value={passwordConfirm}
                  onChange={(e) => {
                    setError(null);
                    setPasswordConfirm(e.target.value);
                  }}
                  type={showPw2 ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="비밀번호를 다시 입력하세요"
                  className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 focus:outline-none transition ${
                    pwMismatch
                      ? "border-red-300 focus:border-red-400"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw2((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-50"
                  aria-label="toggle password confirm"
                >
                  {showPw2 ? (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>

              {pwMismatch && (
                <p className="mt-2 text-sm text-red-600">
                  비밀번호가 일치하지 않습니다.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg ${
                !canSubmit || loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              }`}
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  가입 중...
                </>
              ) : (
                <>
                  회원가입 <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-sm text-gray-500">
              가입 완료 후 로그인 페이지로 이동합니다.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;