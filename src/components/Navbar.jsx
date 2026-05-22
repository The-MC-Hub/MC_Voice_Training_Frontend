import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Bell, User, Settings, LogOut,
  BookOpen, MessageSquare, Wallet, Zap, Award, Menu, X, FileText, CreditCard
} from 'lucide-react';
import {
  Avatar, AvatarFallback, AvatarImage,
  Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownPopover
} from "@heroui/react";
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow } from "date-fns";
import * as notificationController from "../controllers/notificationController";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAuthenticated = !!user;
  const isAdminUser = user && (user.role || '').toLowerCase() === 'admin';

  const loadNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationController.fetchNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleMarkAllRead = async () => {
    await notificationController.markAllNotificationsRead();
    loadNotifications();
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await notificationController.markNotificationRead(notif._id);
      loadNotifications();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/m/dashboard') return location.pathname === path;
    if (path === '/about') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`relative text-[13px] font-medium transition-colors duration-150 ${
        isActive(to) ? 'text-white' : 'text-zinc-500 hover:text-zinc-200'
      }`}
    >
      {children}
      {isActive(to) && (
        <motion.div
          layoutId="nav-underline"
          className="absolute -bottom-[1px] left-0 right-0 h-px bg-[#f5a623]"
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
      )}
    </Link>
  );

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#09090b]/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between gap-8">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 shrink-0 group">
            <span className="text-[15px] font-bold text-white tracking-tight">MC</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623] mb-0.5" />
            <span className="text-[15px] font-bold text-white tracking-tight">Hub</span>
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
                <NavLink to="/m/learning">{t('navbar.academy')}</NavLink>
                <NavLink to="/m/courses">{t('navbar.courses')}</NavLink>
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {!isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors">
                  {t('navbar.login')}
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:block px-4 py-1.5 rounded-lg bg-white text-black text-[13px] font-semibold hover:bg-zinc-100 transition-colors"
                >
                  {t('navbar.join')}
                </Link>
              </div>
            ) : (
              <>
                {/* User Dropdown */}
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/6 transition-colors cursor-pointer">
                      <Avatar className="w-7 h-7 ring-1 ring-white/10">
                        <AvatarImage src={user?.avatar || "https://i.pravatar.cc/150"} />
                        <AvatarFallback className="text-[11px]">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:block text-[13px] font-medium text-zinc-300">
                        {user?.name?.split(' ')[0]}
                      </span>
                    </div>
                  </DropdownTrigger>
                  <DropdownPopover>
                    <DropdownMenu
                      aria-label="User Actions"
                      className="bg-[#111113] border border-white/[0.08] p-1 rounded-xl shadow-xl min-w-[160px]"
                    >
                      <DropdownItem
                        key="settings"
                        className="px-3 py-2 rounded-lg hover:bg-white/[0.06] text-zinc-300 text-[13px]"
                        onPress={() => navigate("/m/settings?tab=profile")}
                      >
                        <div className="flex items-center gap-2.5">
                          <User size={15} className="text-zinc-500" /> {t('navbar.profile')}
                        </div>
                      </DropdownItem>
                      <DropdownItem
                        key="payment"
                        className="px-3 py-2 rounded-lg hover:bg-white/[0.06] text-zinc-300 text-[13px]"
                        onPress={() => navigate("/m/settings?tab=payment")}
                      >
                        <div className="flex items-center gap-2.5">
                          <CreditCard size={15} className="text-zinc-500" /> {t('navbar.orders')}
                        </div>
                      </DropdownItem>
                      <DropdownItem
                        key="logout"
                        className="px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 text-[13px]"
                        onPress={handleLogout}
                      >
                        <div className="flex items-center gap-2.5">
                          <LogOut size={15} /> {t('navbar.logout')}
                        </div>
                      </DropdownItem>
                    </DropdownMenu>
                  </DropdownPopover>
                </Dropdown>
              </>
            )}

          
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
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="fixed top-14 left-0 right-0 z-40 md:hidden bg-[#111113] border-b border-white/[0.08] px-6 py-5"
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
                    <MobileNavLink to="/m/learning" label={t('navbar.academy')} active={isActive('/m/learning')} />
                    <MobileNavLink to="/m/courses" label={t('navbar.courses')} active={isActive('/m/courses')} />
                    <MobileNavLink to="/m/community" label="Community" active={isActive('/m/community')} />
                  </>
                )}
                {!isAuthenticated && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-white/[0.06]">
                    <Link to="/login" className="flex-1 py-2 text-center text-[13px] font-medium border border-white/[0.08] rounded-lg text-zinc-300 hover:bg-white/[0.04] transition-colors">
                      {t('navbar.login')}
                    </Link>
                    <Link to="/register" className="flex-1 py-2 text-center text-[13px] font-semibold bg-white text-black rounded-lg hover:bg-zinc-100 transition-colors">
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
      active ? 'bg-white/[0.06] text-white' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
    }`}
  >
    {label}
  </Link>
);

export default Navbar;
