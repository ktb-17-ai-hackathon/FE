import { Routes, Route } from "react-router-dom";
import SurveyPage from "./pages/SurveyPage";
import PlanResultPage from "./pages/PlanResultPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SurveyPage />} />
      <Route path="/plan/:surveyId" element={<PlanResultPage />} />
    </Routes>
  );
}

export default App;