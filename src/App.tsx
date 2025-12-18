import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SurveyPage from './pages/SurveyPage';
import PlanResultPage from './pages/PlanResultPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RequireAuth from './routes/RequireAuth';

function App() {
  return (
    <Routes>
      {/* 공개 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* 로그인 필요: 홈/설문/결과 */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <HomePage />
          </RequireAuth>
        }
      />
      <Route
        path="/survey"
        element={
          <RequireAuth>
            <SurveyPage />
          </RequireAuth>
        }
      />
      <Route
        path="/plan/:surveyId"
        element={
          <RequireAuth>
            <PlanResultPage />
          </RequireAuth>
        }
      />

      {/* 그 외 -> 홈 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
