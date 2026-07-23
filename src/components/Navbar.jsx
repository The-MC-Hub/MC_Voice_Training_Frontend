import React, { useState, useEffect, useCallback } from 'react';
import AvatarFrame from './ui/AvatarFrame';
import NotificationBell from './NotificationBell';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Settings, Menu, X, Trophy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAppSocket } from '../hooks/useAppSocket';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchNotifications, fetchUnreadCount, onSocketNotification } = useNotificationStore();

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    fetchUnreadCount();
  }, [user?.id]);

  useAppSocket(user?.id, token, { onNotification: onSocketNotification });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [streakFrame, setStreakFrame] = useState(() => {
    try { return localStorage.getItem('mchub_streak_frame') || 'NONE'; } catch { return 'NONE'; }
  });
  useEffect(() => {
    const onStorage = () => {
      try { setStreakFrame(localStorage.getItem('mchub_streak_frame') || 'NONE'); } catch {}
    };
    window.addEventListener('storage', onStorage);
    // Also poll once on mount in case widget already wrote it this session
    onStorage();
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const isAuthenticated = !!user;
  const isAdminUser = user && (user.role || '').toLowerCase() === 'admin';
  const isMc = user && (user.role || '').toLowerCase() === 'mc';

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isDark = location.pathname.startsWith('/m/');

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/m/dashboard') return location.pathname === path;
    if (path === '/about') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`relative text-[13px] font-medium transition-all duration-200 pb-[2px] ${
        isActive(to)
          ? isDark
            ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-500 after:rounded-full'
            : 'text-gray-900 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-500 after:rounded-full'
          : isDark
            ? 'text-zinc-400 hover:text-white'
            : 'text-gray-500 hover:text-gray-900'
      }`}
    >
      {children}
    </Link>
  );

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 h-14 backdrop-blur-md border-b ${
        isDark
          ? 'bg-[#09090b]/90 border-white/6'
          : 'bg-white/90 border-black/8 shadow-sm'
      }`}>
        <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between gap-8">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 shrink-0 group transition-opacity hover:opacity-80">
            <span className={`text-[16px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>MC</span>
            <span className="w-[5px] h-[5px] rounded-full bg-amber-500 mb-0.5 group-hover:scale-110 transition-transform" />
            <span className={`text-[16px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Hub</span>
          </Link>

          {/* Desktop Nav — centered */}
          <div className="hidden md:flex items-center gap-7 flex-1 justify-center border-b border-transparent">
            {isAdminUser ? (
              <>
                <NavLink to="/m/admin/overview">Overview</NavLink>
                <NavLink to="/m/admin/users">Users</NavLink>
                <NavLink to="/m/admin/lessons">Lessons</NavLink>
                <NavLink to="/m/admin/competitions">Arenas</NavLink>
                <NavLink to="/m/admin/transactions">Transactions</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/">{t('navbar.home')}</NavLink>
                <NavLink to="/about">{t('navbar.about')}</NavLink>
                <span data-tour="tour-dashboard"><NavLink to="/m/dashboard">{t('navbar.dashboard')}</NavLink></span>
                <span data-tour="tour-training" data-quest="quest-training-nav"><NavLink to="/m/voice/library">{t('navbar.training')}</NavLink></span>
                <span data-tour="tour-courses" data-quest="quest-courses-nav"><NavLink to="/m/courses">{t('navbar.courses')}</NavLink></span>
                <NavLink to="/m/learning">{t('navbar.learningPath')}</NavLink>
                <NavLink to="/m/leaderboard">
                  <span className="flex items-center gap-1" data-quest="quest-leaderboard-nav">

                    Xếp hạng
                  </span>
                </NavLink>
                <NavLink to="/m/bookings">
                  {(user?.role || '').toLowerCase() === 'mc' ? 'Yêu cầu' : 'Booking'}
                </NavLink>
                <NavLink to="/m/messaging">Tin nhắn</NavLink>
                {(user?.role || '').toLowerCase() === 'client' && (
                  <NavLink to="/m/search">Tìm MC</NavLink>
                )}
                {(user?.role || '').toLowerCase() === 'mc' && (
                  <NavLink to="/m/peer-review">{t('navbar.peerReview')}</NavLink>
                )}
                <Link
                  data-tour="tour-pricing"
                  to="/m/payment"
                  className="text-[13px] font-semibold text-[#f5a623] hover:text-[#e09520] transition-colors"
                >
                  {t('navbar.pricing')}
                </Link>
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {!isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-[13px] font-medium text-gray-500 hover:text-gray-800 transition-colors">
                  {t('navbar.login')}
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:block px-4 py-1.5 rounded-md bg-amber-500 text-white text-[13px] font-semibold hover:bg-amber-600 transition-colors"
                >
                  {t('navbar.join')}
                </Link>
              </div>
            ) : (
              <>
                {/* Avatar + Settings gear */}
                <div className="flex items-center gap-1">
                  <AvatarFrame
                    src={user?.avatar?.startsWith('http') ? user.avatar : undefined}
                    alt={user?.name}
                    frameKey={user ? streakFrame : 'NONE'}
                    size={28}
                    showBadge={streakFrame !== 'NONE'}
                    fallbackEmoji={
                      user?.avatar && !user.avatar.startsWith('http') && user.avatar.length <= 4
                        ? user.avatar : '😊'
                    }
                  />
                  <span className={`hidden lg:block text-[13px] font-medium mx-1 ${isDark ? 'text-zinc-300' : 'text-gray-600'}`}>
                    {user?.name?.split(' ')[0]}
                  </span>
                  {user?.isPremium ? (
                    <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-[10px] font-bold text-amber-700 uppercase tracking-wide">
                      {user?.plan || 'Premium'}
                    </span>
                  ) : (
                    <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                      Free
                    </span>
                  )}
                  <NotificationBell isDark={isDark} />
                  <Link
                    data-tour="tour-settings"
                    data-quest="quest-settings-nav"
                    to="/m/settings"
                    className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${isDark ? 'text-zinc-500 hover:text-white hover:bg-white/[0.07]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                  >
                    <Settings size={16} />
                  </Link>
                </div>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(v => !v)}
              className={`flex md:hidden w-11 h-11 items-center justify-center rounded-md transition-colors ${isDark ? 'text-zinc-500 hover:text-white hover:bg-white/[0.07]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
            >
              {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 z-40 md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="fixed top-14 left-0 right-0 z-40 md:hidden bg-white border-b border-black/8 shadow-md px-6 py-5"
            >
              <nav className="flex flex-col gap-1">
                {isAdminUser ? (
                  <>
                    <MobileNavLink to="/m/admin/overview" label="Overview" active={isActive('/m/admin/overview')} />
                    <MobileNavLink to="/m/admin/users" label="Users" active={isActive('/m/admin/users')} />
                    <MobileNavLink to="/m/admin/lessons" label="Lessons" active={isActive('/m/admin/lessons')} />
                    <MobileNavLink to="/m/admin/competitions" label="Arenas" active={isActive('/m/admin/competitions')} />
                    <MobileNavLink to="/m/admin/transactions" label="Transactions" active={isActive('/m/admin/transactions')} />
                  </>
                ) : (
                  <>
                    <MobileNavLink to="/about" label={t('navbar.about')} active={isActive('/about')} />
                    <MobileNavLink to="/m/dashboard" label={t('navbar.dashboard')} active={isActive('/m/dashboard')} />
                    <MobileNavLink to="/m/voice/library" label={t('navbar.training')} active={isActive('/m/voice')} />
                    <MobileNavLink to="/m/courses" label={t('navbar.courses')} active={isActive('/m/courses')} />
                    <MobileNavLink to="/m/learning" label={t('navbar.learningPath')} active={isActive('/m/learning')} />
                    <MobileNavLink to="/m/leaderboard" label="🏆 Xếp hạng" active={isActive('/m/leaderboard')} />
                    <MobileNavLink to="/m/bookings" label={isMc ? 'Yêu cầu' : 'Booking'} active={isActive('/m/bookings')} />
                    <MobileNavLink to="/m/messaging" label="Tin nhắn" active={isActive('/m/messaging')} />
                    {(user?.role || '').toLowerCase() === 'client' && (
                      <MobileNavLink to="/m/search" label="Tìm MC" active={isActive('/m/search')} />
                    )}
                    {isMc && (
                      <MobileNavLink to="/m/peer-review" label={t('navbar.peerReview')} active={isActive('/m/peer-review')} />
                    )}
                    <MobileNavLink to="/m/payment" label={t('navbar.pricing')} active={isActive('/m/payment')} />
                  </>
                )}
                {!isAuthenticated && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-black/8">
                    <Link to="/login" className="flex-1 py-2 text-center text-[13px] font-medium border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
                      {t('navbar.login')}
                    </Link>
                    <Link to="/register" className="flex-1 py-2 text-center text-[13px] font-semibold bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors">
                      {t('navbar.join')}
                    </Link>
                  </div>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const MobileNavLink = ({ to, label, active }) => (
  <Link
    to={to}
    className={`px-3 py-2.5 rounded-md text-[14px] font-medium transition-colors ${
      active ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`}
  >
    {label}
  </Link>
);

export default Navbar;
