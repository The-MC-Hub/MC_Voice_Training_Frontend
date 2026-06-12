import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Settings, Menu, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAuthenticated = !!user;
  const isAdminUser = user && (user.role || '').toLowerCase() === 'admin';

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
                <NavLink to="/m/dashboard">{t('navbar.dashboard')}</NavLink>
                <NavLink to="/m/voice/library">{t('navbar.training')}</NavLink>
                <NavLink to="/m/courses">{t('navbar.courses')}</NavLink>
                <Link
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
                  className="hidden sm:block px-4 py-1.5 rounded-lg bg-amber-500 text-white text-[13px] font-semibold hover:bg-amber-600 transition-colors"
                >
                  {t('navbar.join')}
                </Link>
              </div>
            ) : (
              <>
                {/* Avatar + Settings gear */}
                <div className="flex items-center gap-1">
                  {(() => {
                    const av = user?.avatar;
                    const isUrl = av && av.startsWith('http');
                    const isEmoji = av && !av.includes('.') && av.length <= 4;
                    return (
                      <div className={`w-7 h-7 rounded-full ring-1 flex items-center justify-center shrink-0 text-base leading-none ${isDark ? 'bg-white/10 ring-white/10' : 'bg-gray-100 ring-black/10'}`}>
                        {isUrl
                          ? <img src={av} alt="avatar" className="w-full h-full object-cover rounded-full" />
                          : isEmoji
                            ? av
                            : <span className="text-base">😊</span>
                        }
                      </div>
                    );
                  })()}
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
                  <Link
                    to="/m/settings"
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isDark ? 'text-zinc-500 hover:text-white hover:bg-white/[0.07]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                  >
                    <Settings size={16} />
                  </Link>
                </div>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(v => !v)}
              className={`flex md:hidden w-8 h-8 items-center justify-center rounded-lg transition-colors ${isDark ? 'text-zinc-500 hover:text-white hover:bg-white/[0.07]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
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
                    <MobileNavLink to="/m/payment" label={t('navbar.pricing')} active={isActive('/m/payment')} />
                  </>
                )}
                {!isAuthenticated && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-black/8">
                    <Link to="/login" className="flex-1 py-2 text-center text-[13px] font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                      {t('navbar.login')}
                    </Link>
                    <Link to="/register" className="flex-1 py-2 text-center text-[13px] font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
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
    className={`px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
      active ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`}
  >
    {label}
  </Link>
);

export default Navbar;
