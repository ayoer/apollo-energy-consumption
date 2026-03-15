import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { useAppSelector } from './store/hooks';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Organizations from './pages/admin/Organizations';
import Users from './pages/admin/Users';
import UserDetail from './pages/admin/UserDetail';
import Meters from './pages/admin/Meters';
import Reports from './pages/admin/Reports';
import UserDashboard from './pages/user/Dashboard';

function RootRedirect() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
}

export default function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1677ff' } }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/organizations" element={<Organizations />} />
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/users/:id" element={<UserDetail />} />
              <Route path="/admin/meters" element={<Meters />} />
              <Route path="/admin/reports" element={<Reports />} />
            </Route>
          </Route>

          {/* User routes */}
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route element={<UserLayout />}>
              <Route path="/dashboard" element={<UserDashboard />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
