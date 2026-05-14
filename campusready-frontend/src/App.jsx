import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import LoginPage from './pages/LoginPage';
import ModulesPage from './pages/ModulesPage';
import ProgressPage from './pages/ProgressPage';
import AdminModulePage from './pages/AdminModulePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/modules" element={<ModulesPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin/modules" element={<AdminModulePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
