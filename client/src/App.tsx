import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LandingPage } from './pages/shared/LandingPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/shared/Dashboard';
import { TasksPage } from './pages/shared/TasksPage';
import { MessagesPage } from './pages/shared/MessagesPage';
import { MeetingsPage } from './pages/shared/MeetingsPage';
import { AnnouncementsPage } from './pages/shared/AnnouncementsPage';
import { RequestsPage } from './pages/shared/RequestsPage';
import { AIAssistantPage } from './pages/shared/AIAssistantPage';
import { FacultyDirectoryPage } from './pages/shared/FacultyDirectoryPage';
import { RegistrationApprovalsPage } from './pages/hod/RegistrationApprovalsPage';
import { SettingsPage } from './pages/shared/SettingsPage';
import { AcademicCalendarPage } from './pages/shared/AcademicCalendarPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F7F8FA]">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-[#7051C8] border-t-transparent animate-spin" />
          <span className="text-xs text-[#737784] font-medium">Loading UniSync Workspace...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public Landing & Authentication Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Authenticated Application Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/calendar" element={<AcademicCalendarPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/meetings" element={<MeetingsPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/ai-assistant" element={<AIAssistantPage />} />
              <Route path="/faculty" element={<FacultyDirectoryPage />} />
              <Route
                path="/registration-approvals"
                element={
                  <ProtectedRoute allowedRoles={['HOD']}>
                    <RegistrationApprovalsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all fallback: redirect to landing page if unauthenticated, or dashboard if logged in */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
