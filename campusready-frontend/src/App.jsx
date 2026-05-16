import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import LoginPage from './pages/LoginPage';
import ModulesPage from './pages/ModulesPage';
import ProgressPage from './pages/ProgressPage';
import AdminModulePage from './pages/AdminModulePage';
import QuizPage from './pages/QuizPage';
import AdminQuizPage from './pages/AdminQuizPage';
import LeaderboardPage from './pages/LeaderboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/modules" element={<ModulesPage />} />
          <Route path="/modules/:moduleId" element={<ModulesPage />} />
          <Route path="/quiz/:moduleId" element={<QuizPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin/modules" element={<AdminModulePage />} />
            <Route path="/admin/quizzes" element={<AdminQuizPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
