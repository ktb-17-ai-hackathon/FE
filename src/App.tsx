import { Routes, Route } from "react-router-dom";
import SurveyPage from "./pages/SurveyPage";
import PlanResultPage from "./pages/PlanResultPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import RequireAuth from "./routes/RequireAuth";

function App() {
  return (
    <Routes>
      {/* 로그인/회원가입 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/*  로그인 안 하면 설문 못 감 */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <SurveyPage />
          </RequireAuth>
        }
      />

      {/* (선택) 결과 페이지도 로그인 필요하면 같이 감싸기 */}
      <Route
        path="/plan/:surveyId"
        element={
          <RequireAuth>
            <PlanResultPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
