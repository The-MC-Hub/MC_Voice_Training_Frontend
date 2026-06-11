import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/useAuthStore';
import PageLoader from './components/ui/PageLoader';
import PageTransition from './components/animations/PageTransition';
import { ThemeProvider } from './contexts/ThemeContext';

import Home from './pages/Home';
import About from './pages/About';
import ComingSoon from './pages/ComingSoon';
import Login from './pages/Login';
import Register from './pages/Register';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyHub';
import HelpCenter from './pages/HelpCenter';
import ContactUs from './pages/ContactUs';
import Onboarding from './pages/Onboarding';
import ForgotPassword from './pages/ForgotPassword';
import Layout from './layout/MainLayout';
import AdSidebar from './components/ui/AdSidebar';
import PopularLessonsSidebar from './components/ui/PopularLessonsSidebar';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Success = lazy(() => import('./pages/Success'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PaymentResult = lazy(() => import('./pages/PaymentResult'));
const VoiceLibrary = lazy(() => import('./pages/VoiceLibrary'));
const VoicePractice = lazy(() => import('./pages/VoicePractice'));
const VoiceReport = lazy(() => import('./pages/VoiceReport'));
const Community = lazy(() => import('./pages/Community'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));


const GuestRoute = ({ children }) => {
  const { isAuthenticated, role } = useAuthStore();
  if (isAuthenticated) {
    const userRole = (role || '').toLowerCase();
    return <Navigate to={userRole === 'admin' ? '/m/admin' : '/m/dashboard'} replace />;
  }
  return children;
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const normalizedRole = (role || '').toLowerCase();
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());
  if (!normalizedAllowed.includes(normalizedRole))
    return <Navigate to={normalizedRole === 'admin' ? '/m/admin' : '/m/dashboard'} replace />;
  return children;
};

const Wrap = ({ children }) => <PageTransition>{children}</PageTransition>;

const NO_SIDEBAR_PATHS = ['/m/admin', '/m/voice/practice', '/login', '/register', '/onboarding'];

function App() {
  const { role, user, isAuthenticated, refreshUser } = useAuthStore();
  const location = useLocation();
  const noSidebar = NO_SIDEBAR_PATHS.some(p => location.pathname.startsWith(p));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated && user && user.plan === undefined) {
      refreshUser();
    }
  }, [isAuthenticated]);

  return (
    <ThemeProvider>
      <div className={`app-container${noSidebar ? '' : ' md:pr-45 md:pl-45'}`}>
        <PopularLessonsSidebar />
        <AdSidebar />
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  (role || '').toLowerCase() === 'admin'
                    ? <Navigate to="/m/admin" replace />
                    : <Wrap><Home /></Wrap>
                }
              />
              <Route path="/about" element={<Wrap><About /></Wrap>} />
              <Route path="/courses" element={<Wrap><ComingSoon title="Học Viện MC" description="Hệ thống khóa học MC chuyên nghiệp đang được xây dựng. Sẽ ra mắt sớm." /></Wrap>} />
              <Route path="/login" element={<GuestRoute><Wrap><Login /></Wrap></GuestRoute>} />
              <Route path="/forgot-password" element={<GuestRoute><Wrap><ForgotPassword /></Wrap></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Wrap><Register /></Wrap></GuestRoute>} />
              <Route path="/terms" element={<Wrap><TermsOfService /></Wrap>} />
              <Route path="/privacy" element={<Wrap><PrivacyPolicy /></Wrap>} />
              <Route path="/help" element={<Wrap><HelpCenter /></Wrap>} />
              <Route path="/contact" element={<Wrap><ContactUs /></Wrap>} />
              <Route path="/onboarding" element={<ProtectedRoute><Wrap><Onboarding /></Wrap></ProtectedRoute>} />

              <Route path="/m" element={<Layout />}>
                <Route
                  path="dashboard"
                  element={(() => {
                    const r = (role || '').toLowerCase();
                    if (r === 'admin') return <Navigate to="/m/admin" replace />;
                    return <ProtectedRoute><Wrap><Dashboard /></Wrap></ProtectedRoute>;
                  })()}
                />
                <Route path="settings" element={<ProtectedRoute><Wrap><Settings /></Wrap></ProtectedRoute>} />
                <Route path="payment" element={<ProtectedRoute><Wrap><PaymentPage /></Wrap></ProtectedRoute>} />





                <Route path="success" element={<ProtectedRoute><Wrap><Success /></Wrap></ProtectedRoute>} />
                <Route path="wallet" element={<RoleRoute allowedRoles={['mc', 'admin']}><Wrap><Wallet /></Wrap></RoleRoute>} />

                <Route path="voice/library" element={<Wrap><VoiceLibrary /></Wrap>} />
                <Route path="voice/report/:sessionId" element={<ProtectedRoute><Wrap><VoiceReport /></Wrap></ProtectedRoute>} />

                <Route path="learning" element={<Wrap><ComingSoon title="Lộ trình học tập" description="Lộ trình luyện tập MC theo từng cấp độ đang được phát triển. Sẽ ra mắt sớm." /></Wrap>} />
                <Route path="learning/milestone/:id" element={<Wrap><ComingSoon title="Lộ trình học tập" description="Lộ trình luyện tập MC theo từng cấp độ đang được phát triển. Sẽ ra mắt sớm." /></Wrap>} />
                <Route path="community" element={<Wrap><Community /></Wrap>} />
                <Route path="courses" element={<Wrap><ComingSoon title="Khóa học MC" description="Hệ thống khóa học MC chuyên nghiệp đang được xây dựng. Sẽ ra mắt sớm." /></Wrap>} />
                <Route path="courses/:id" element={<Wrap><ComingSoon title="Chi tiết khóa học" description="Hệ thống khóa học MC chuyên nghiệp đang được xây dựng. Sẽ ra mắt sớm." /></Wrap>} />
              </Route>

              {/* Full-screen views (outside MainLayout — no Navbar/Footer) */}
              <Route path="/m/admin" element={<RoleRoute allowedRoles={['admin']}><Wrap><AdminDashboard /></Wrap></RoleRoute>} />
              <Route path="/m/admin/:section" element={<RoleRoute allowedRoles={['admin']}><Wrap><AdminDashboard /></Wrap></RoleRoute>} />
              <Route path="/m/voice/practice/:id" element={<ProtectedRoute><Wrap><VoicePractice /></Wrap></ProtectedRoute>} />
              <Route path="/m/learning/guide/:id" element={<Wrap><ComingSoon title="Tài liệu học tập" description="Hệ thống tài liệu hướng dẫn đang được xây dựng. Sẽ ra mắt sớm." /></Wrap>} />

              <Route path="/payment/success" element={<ProtectedRoute><Wrap><PaymentResult /></Wrap></ProtectedRoute>} />
              <Route path="/payment/cancel" element={<ProtectedRoute><Wrap><PaymentResult /></Wrap></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </div>
    </ThemeProvider>
  );
}

export default App;
