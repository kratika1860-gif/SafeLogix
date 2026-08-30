import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DriverLayout from './layouts/DriverLayout';
import DriverDashboard from './pages/DriverDashboard';
import SettingsAndProfile from './pages/SettingsAndProfile';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import CommandMap from './pages/admin/CommandMap';
import Incidents from './pages/admin/Incidents';
import Vehicles from './pages/admin/Vehicles';
import Drivers from './pages/admin/Drivers';
import AIAnalytics from './pages/admin/AIAnalytics';
import AlertManagement from './pages/admin/AlertManagement';
import EmergencyMode from './pages/admin/EmergencyMode';
import SystemHealth from './pages/admin/SystemHealth';
import Trips from './pages/admin/Trips';
import Users from './pages/admin/Users';
import SOSAlerts from './pages/admin/SOSAlerts';
import Login from './pages/Login';
import { useAppStore } from './store/useAppStore';

function ProtectedRoute({ children, allowedRoles, bypassLogin }: { children: React.ReactNode, allowedRoles?: string[], bypassLogin?: boolean }) {
  const { user, isAuthenticated, isLoadingAuth } = useAppStore();

  if (isLoadingAuth) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-100">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-slate-600 font-medium">Verifying Session...</div>
        </div>
      </div>
    );
  }

  if (bypassLogin && isAuthenticated && user) {
    return <Navigate to={['driver', 'field_user'].includes(user.role) ? "/driver" : "/admin"} replace />;
  }

  if (!bypassLogin && (!isAuthenticated || !user)) {
    const token = localStorage.getItem('DEV_MOCK_TOKEN');
    if (token && !localStorage.getItem('LOGGED_OUT')) {
      return (
        <div className="h-screen w-full flex items-center justify-center bg-[#18181B]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-[#D4A373] border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-zinc-400 font-medium">Connecting to Driver Portal...</div>
          </div>
        </div>
      );
    }
    return <Navigate to="/login" replace />;
  }

  if (!bypassLogin && user && allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Unauthorized</h2>
          <p className="text-slate-600 mb-6">You do not have permission to view this page. Requires roles: {allowedRoles.join(', ')}</p>
          <button onClick={() => useAppStore.getState().logout()} className="w-full bg-slate-200 text-slate-800 py-2 rounded-lg font-bold hover:bg-slate-300">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function RootRedirect() {
  const { user, isAuthenticated } = useAppStore();
  if (!isAuthenticated || !user) {
    const token = localStorage.getItem('DEV_MOCK_TOKEN');
    if (token && token.includes('ADMIN')) return <Navigate to="/admin" replace />;
    if (localStorage.getItem('LOGGED_OUT')) return <Navigate to="/login" replace />;
    return <Navigate to="/driver" replace />;
  }
  if (user.role === 'driver' || user.role === 'field_user') {
    return <Navigate to="/driver" replace />;
  }
  return <Navigate to="/admin" replace />;
}

export default function App() {
  const { initializeAuth, user, theme } = useAppStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <ProtectedRoute bypassLogin={true}>
            <Login />
          </ProtectedRoute>
        } />
        <Route path="/" element={<RootRedirect />} />
        
        <Route path="/driver" element={
          <ProtectedRoute allowedRoles={['driver', 'field_user']}>
            <DriverLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DriverDashboard />} />
          <Route path="profile" element={<SettingsAndProfile />} />
        </Route>

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin', 'district_officer', 'logistics_coordinator', 'emergency_coordinator']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="map" element={<CommandMap />} />
                    <Route path="incidents" element={<Incidents />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="trips" element={<Trips />} />
          <Route path="analytics" element={<AIAnalytics />} />
          <Route path="alerts" element={<AlertManagement />} />
          <Route path="emergency" element={<EmergencyMode />} />
          <Route path="health" element={<SystemHealth />} />
          <Route path="users" element={<Users />} />
          <Route path="sos" element={<SOSAlerts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
