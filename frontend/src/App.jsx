import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import AddApplicationPage from './pages/AddApplicationPage';
import ApplicationDetailsPage from './pages/ApplicationDetailsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import DashboardPage from './pages/DashboardPage';
import EditApplicationPage from './pages/EditApplicationPage';
import InterviewsPage from './pages/InterviewsPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/applications/new" element={<AddApplicationPage />} />
              <Route path="/applications/:id" element={<ApplicationDetailsPage />} />
              <Route path="/applications/:id/edit" element={<EditApplicationPage />} />
              <Route path="/interviews" element={<InterviewsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
