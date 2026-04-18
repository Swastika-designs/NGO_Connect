import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import NGOs from './pages/NGOs';
import NGODetail from './pages/NGODetail';
import Auth from './pages/Auth';
import DonorDashboard from './pages/DonorDashboard';
import NGODashboard from './pages/NGODashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateNGO from './pages/CreateNGO';
import PostEvent from './pages/PostEvent';
import NotFound from './pages/NotFound';
import DonorProfile from './pages/DonorProfile';
import VolunteerProfile from './pages/VolunteerProfile';
import NGOProfile from './pages/NGOProfile';
import AdminNGOs from './pages/AdminNGOs';
import AdminUsers from './pages/AdminUsers';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--gray-50)' }}>
      <span className="spinner" style={{ width:36, height:36 }} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const ProfileRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'volunteer') return <VolunteerProfile />;
  if (user.role === 'ngo') return <NGOProfile />;
  if (user.role === 'admin') return <Navigate to="/dashboard" />;
  return <DonorProfile />;
};

const DashboardRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'ngo') return <NGODashboard />;
  if (user.role === 'volunteer') return <VolunteerDashboard />;
  return <DonorDashboard />;
};

const PublicLayout = ({ children }) => (
  <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
    <Navbar />
    <main style={{ flex:1 }}>{children}</main>
    <Footer />
  </div>
);

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/ngos" element={<PublicLayout><NGOs /></PublicLayout>} />
      <Route path="/ngos/:id" element={<PublicLayout><NGODetail /></PublicLayout>} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Auth tab="login" />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Auth tab="register" />} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardRouter /></PrivateRoute>} />
      <Route path="/dashboard/profile" element={<PrivateRoute><ProfileRouter /></PrivateRoute>} />
      <Route path="/dashboard/post-event" element={<PrivateRoute roles={['ngo','admin']}><PostEvent /></PrivateRoute>} />
      <Route path="/dashboard/create-ngo" element={<PrivateRoute roles={['ngo','admin']}><CreateNGO /></PrivateRoute>} />
      <Route path="/dashboard/admin/ngos" element={<PrivateRoute roles={['admin']}><AdminNGOs /></PrivateRoute>} />
      <Route path="/dashboard/admin/users" element={<PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute>} />
      <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
