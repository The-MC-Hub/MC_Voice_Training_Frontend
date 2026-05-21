import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/useAuthStore';
import PageLoader from './components/ui/PageLoader';
import PageTransition from './components/animations/PageTransition';
import { ThemeProvider } from './contexts/ThemeContext';

import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyHub';
import HelpCenter from './pages/HelpCenter';
import ContactUs from './pages/ContactUs';
import Onboarding from './pages/Onboarding';
import ForgotPassword from './pages/ForgotPassword';
import Layout from './layout/MainLayout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Learning = lazy(() => import('./pages/Learning'));
const Success = lazy(() => import('./pages/Success'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PaymentResult = lazy(() => import('./pages/PaymentResult'));
const VoiceLibrary = lazy(() => import('./pages/VoiceLibrary'));
const VoicePractice = lazy(() => import('./pages/VoicePractice'));
const VoiceReport = lazy(() => import('./pages/VoiceReport'));
const CoursesPublic = lazy(() => import('./pages/CoursesPublic'));
const MilestoneDetail = lazy(() => import('./pages/MilestoneDetail'));
const ReadingView = lazy(() => import('./pages/ReadingView'));
const Community = lazy(() => import('./pages/Community'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const CoursesList = lazy(() => import('./pages/CoursesList'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));


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

function App() {
  const { role } = useAuthStore();
  const location = useLocation();

  return (
    <ThemeProvider>
      <div className="app-container">
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
              <Route path="/courses" element={<Wrap><CoursesPublic /></Wrap>} />
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
                <Route path="notifications" element={<ProtectedRoute><Wrap><Notifications /></Wrap></ProtectedRoute>} />
                <Route path="settings" element={<ProtectedRoute><Wrap><Settings /></Wrap></ProtectedRoute>} />
                <Route path="payment" element={<ProtectedRoute><Wrap><PaymentPage /></Wrap></ProtectedRoute>} />

                <Route path="admin" element={<RoleRoute allowedRoles={['admin']}><Wrap><AdminDashboard /></Wrap></RoleRoute>} />
                <Route path="admin/:section" element={<RoleRoute allowedRoles={['admin']}><Wrap><AdminDashboard /></Wrap></RoleRoute>} />




                <Route path="success" element={<ProtectedRoute><Wrap><Success /></Wrap></ProtectedRoute>} />
                <Route path="wallet" element={<RoleRoute allowedRoles={['mc', 'admin']}><Wrap><Wallet /></Wrap></RoleRoute>} />

                <Route path="voice/library" element={<Wrap><VoiceLibrary /></Wrap>} />
                <Route path="voice/report/:sessionId" element={<ProtectedRoute><Wrap><VoiceReport /></Wrap></ProtectedRoute>} />

                <Route path="learning" element={<Wrap><Learning /></Wrap>} />
                <Route path="learning/milestone/:id" element={<ProtectedRoute><Wrap><MilestoneDetail /></Wrap></ProtectedRoute>} />
                <Route path="community" element={<Wrap><Community /></Wrap>} />
                <Route path="courses" element={<ProtectedRoute><Wrap><CoursesList /></Wrap></ProtectedRoute>} />
                <Route path="courses/:id" element={<ProtectedRoute><Wrap><CourseDetail /></Wrap></ProtectedRoute>} />
              </Route>

              {/* Full-screen curriculum views (outside MainLayout) */}
              <Route path="/m/voice/practice/:id" element={<ProtectedRoute><Wrap><VoicePractice /></Wrap></ProtectedRoute>} />
              <Route path="/m/learning/guide/:id" element={<ProtectedRoute><Wrap><ReadingView /></Wrap></ProtectedRoute>} />

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
