// App.jsx — Root router with protected routes
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { useTheme } from './context/ThemeContext';

import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DiagnosisPage from './pages/DiagnosisPage';
import HistoryPage from './pages/HistoryPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="animate-spin w-10 h-10 border-2 border-brand border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/diagnosis" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={isAdmin ? '/admin' : '/diagnosis'} replace />;
  return children;
}

function DiagnosisRoute() {
  const { isAdmin } = useAuth();
  if (isAdmin) return <Navigate to="/dashboard" replace />;
  return <DiagnosisPage />;
}

function DashboardRoute() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/diagnosis" replace />;
  return <DashboardPage />;
}

function HistoryRoute() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/diagnosis" replace />;
  return <HistoryPage />;
}

function AppRoutes() {
  const { isAdmin } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardRoute />} />
        <Route path="/diagnosis" element={<DiagnosisRoute />} />
        <Route path="/history" element={<HistoryRoute />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to={isAdmin ? '/admin' : '/diagnosis'} replace />} />
      <Route path="*" element={<Navigate to={isAdmin ? '/admin' : '/diagnosis'} replace />} />
    </Routes>
  );
}

function ThemedToaster() {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: isDark ? 'rgb(22, 32, 52)' : '#ffffff',
          color: isDark ? '#e2e8f0' : '#334155',
          border: isDark ? '1px solid rgb(51, 65, 85)' : '1px solid #e2e8f0',
          borderRadius: '14px',
          fontSize: '14px',
          boxShadow: isDark
            ? '0 8px 32px rgba(0,0,0,0.4)'
            : '0 4px 24px -4px rgba(13, 148, 136, 0.15)',
        },
        success: {
          iconTheme: {
            primary: isDark ? '#2dd4bf' : '#0d9488',
            secondary: isDark ? '#162034' : '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: isDark ? '#162034' : '#ffffff',
          },
        },
      }}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
          <ThemedToaster />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
