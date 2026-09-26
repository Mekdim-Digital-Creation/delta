import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import { useAuth } from './context/AuthContext.jsx';

function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center text-slate-400">Loading…</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/admin/*"
        element={
          <AdminGuard>
            <AdminDashboard />
          </AdminGuard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}