import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { verifyMC, suspendUser } from "../controllers/adminController";
import { useAdminData } from "../hooks/useAdminData";
import {
  Users, ShieldCheck, BookOpen, LayoutGrid, CreditCard,
  BarChart2, Award, Trophy, Settings, Terminal, LogOut, Megaphone, Package, Bell, HelpCircle, GraduationCap, Shield,
  Menu, X,
} from "lucide-react";

import DashboardSection, { DASHBOARD_NAV } from "./admin/sections/DashboardSection";
import UserManagement from "./admin/sections/UserManagement";
import LessonManagement from "./admin/sections/LessonManagement";
import TransactionManagement from "./admin/sections/TransactionManagement";
import { useAuthStore } from "../store/useAuthStore";
import AcademyManager from "./admin/AcademyManager";
import CompetitionManager from "./admin/CompetitionManager";
import ServerLogs from "./admin/sections/ServerLogs";
import MarketingManager from "./admin/sections/MarketingManager";
import PlanManager from "./admin/PlanManager";
import NotificationManager from "./admin/sections/NotificationManager";
import AdminGuide from "./admin/sections/AdminGuide";
import CoursePricingManager from "./admin/sections/CoursePricingManager";
import SecurityLogs from "./admin/sections/SecurityLogs";
import NotificationAdmin from "./admin/sections/NotificationAdmin";

const AdminDashboard = () => {
  const { t } = useTranslation();

  const NAV_ITEMS = [
    { id: "dashboard", label: t('admin.dashboard.navDashboard'), icon: LayoutGrid },
    { id: "users", label: t('admin.dashboard.navUsers'), icon: Users },
    { id: "lessons", label: t('admin.dashboard.navLessons'), icon: BookOpen },
    { id: "transactions", label: t('admin.dashboard.navTransactions'), icon: CreditCard },
    { id: "academy", label: t('admin.dashboard.navAcademy'), icon: Award },
    { id: "courses", label: t('admin.dashboard.navCourses'), icon: GraduationCap },
    { id: "competitions", label: t('admin.dashboard.navCompetitions'), icon: Trophy },
    { id: "logs", label: t('admin.dashboard.navServerLogs'), icon: Terminal },
    { id: "marketing", label: t('admin.dashboard.navMarketing'), icon: Megaphone },
    { id: "plans", label: t('admin.dashboard.navPlans'), icon: Package },
    { id: "notifications", label: t('admin.dashboard.navNotifications'), icon: Bell },
    { id: "user-notifications", label: t('admin.dashboard.navUserNotifications'), icon: Bell },
    { id: "guide", label: t('admin.dashboard.navGuide'), icon: HelpCircle },
    { id: "security-logs", label: t('admin.dashboard.navSecurityLogs'), icon: Shield },
  ];
  const { section = "dashboard" } = useParams();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [activeDashboardSection, setActiveDashboardSection] = useState("tong-quan");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const {
    users, transactions, revenueStats, dashStats, analytics, growthAnalytics,
    loading: adminLoading, refetch: refetchAll,
  } = useAdminData();

  const handleVerify = async (id, cur) => {
    const u = users?.find(x => (x._id || x.id) === id);
    try { await verifyMC(id, !cur, u?.isActive ?? true); refetchAll(); }
    catch { alert(t('admin.dashboard.verificationFailed')); }
  };

  const handleSuspend = async (id, cur) => {
    const u = users?.find(x => (x._id || x.id) === id);
    try { await suspendUser(id, !cur, u?.isVerified ?? false); refetchAll(); }
    catch { alert(t('admin.dashboard.suspendFailed')); }
  };

  const revenueData = useMemo(() => {
    if (!revenueStats?.monthlyRevenue) return [];
    const MN = {
      '01': 'T1', '02': 'T2', '03': 'T3', '04': 'T4', '05': 'T5', '06': 'T6',
      '07': 'T7', '08': 'T8', '09': 'T9', '10': 'T10', '11': 'T11', '12': 'T12'
    };
    return Object.entries(revenueStats.monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, revenue]) => ({ name: MN[k.split('-')[1]] || k, revenue }));
  }, [revenueStats]);

  const userData = useMemo(() => {
    if (!users) return [];
    const r = users.reduce((acc, u) => {
      const k = (u.role || "").toLowerCase();
      acc[k] = (acc[k] || 0) + 1; return acc;
    }, {});
    return [
      { name: 'MC', value: r.mc || 0, color: '#3B82F6' },
      { name: 'Client', value: r.client || 0, color: '#10B981' },
    ];
  }, [users]);

  const stats = [
    { label: t('admin.dashboard.statTotalUsers'), value: dashStats?.totalUsers ?? (users?.filter(u => (u.role || '').toLowerCase() !== 'admin').length ?? 0), icon: Users, color: "text-blue-500", trend: t('admin.dashboard.statRegistered') },
    { label: t('admin.dashboard.statSuccessfulTransactions'), value: dashStats?.completedTransactions ?? 0, icon: ShieldCheck, color: "text-emerald-500", trend: t('admin.dashboard.statPendingFailed', { pending: dashStats?.pendingTransactions ?? 0, failed: dashStats?.failedTransactions ?? 0 }) },
    { label: t('admin.dashboard.statTotalTransactions'), value: dashStats?.totalTransactions ?? transactions?.length ?? 0, icon: CreditCard, color: "text-amber-500", trend: t('admin.dashboard.statSystemWide') },
    { label: t('admin.dashboard.statActualRevenue'), value: dashStats?.totalRevenue ?? revenueStats?.totalRevenue ?? 0, icon: BarChart2, color: "text-purple-500", trend: t('admin.dashboard.statCompletedTransactions'), isMoney: true },
  ];

  const currentItem = NAV_ITEMS.find(n => n.id === section);

  // redirect legacy URLs
  const resolvedSection = (section === "overview" || section === "analytics") ? "dashboard" : section;

  const goTo = (id) => { navigate(`/m/admin/${id}`); setIsMobileNavOpen(false); };

  return (
    <div className="fixed inset-0 z-[100] flex overflow-hidden bg-[--bg-base] text-[--text-primary]">

      {/* ── Mobile scrim ────────────────────────────────────────────────── */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-[110] bg-black/50 lg:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-[120] w-[240px] shrink-0 flex flex-col border-r border-[--border-subtle] bg-[--bg-surface] transition-transform duration-200 lg:static lg:z-auto lg:w-[220px] lg:translate-x-0 ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[--border-subtle] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#f5a623] flex items-center justify-center">
              <Settings size={14} className="text-black" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[--text-primary] leading-none">MCHub</p>
              <p className="text-[10px] text-[--text-muted] mt-0.5">{t('admin.dashboard.adminControl')}</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileNavOpen(false)}
            className="lg:hidden w-9 h-9 flex items-center justify-center text-[--text-muted] hover:text-[--text-primary]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 min-h-0 p-3 space-y-1 overflow-y-auto">
          <p className="text-[9px] text-[--text-muted] uppercase tracking-widest font-semibold px-3 py-2">{t('admin.dashboard.menu')}</p>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = resolvedSection === id;
            return (
              <div key={id} className="w-full mt-4">
                <button
                  onClick={() => goTo(id)}
                  className={` w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium transition-all text-left ${isActive
                    ? "bg-[#f5a623]/[0.12] text-[#f5a623] border border-[#f5a623]/20"
                    : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-elevated] border border-transparent"
                    }`}
                >
                  <Icon size={15} className={isActive ? "text-[#f5a623]" : ""} />
                  {label}
                </button>
                {id === "dashboard" && isActive && (
                  <div className="pl-8 pr-3 py-1 space-y-1 mt-1 border-l border-[--border-subtle] ml-4">
                    {DASHBOARD_NAV.map(({ id: subId, labelKey: subLabelKey }) => {
                      const isSubActive = activeDashboardSection === subId;
                      return (
                        <button
                          key={subId}
                          onClick={() => { document.getElementById(subId)?.scrollIntoView({ behavior: "smooth", block: "start" }); setIsMobileNavOpen(false); }}
                          className={`w-full text-left text-[11px] py-1.5 px-2 transition-colors ${isSubActive ? "text-[#f5a623] font-medium bg-[#f5a623]/10" : "text-[--text-muted] hover:text-[--text-primary]"
                            }`}
                        >
                          {t(subLabelKey)}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[--border-subtle] space-y-3">
          <div className="flex items-center gap-2 px-2">
            <div className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-[--text-muted]">{t('admin.dashboard.systemOnline')}</span>
          </div>
          {user && (
            <div className="px-2 pb-1">
              <p className="text-[11px] text-[--text-muted] truncate mb-2">{user.name || user.email}</p>
              <button
                onClick={() => { logout(); navigate("/m/login"); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
              >
                <LogOut size={13} />
                {t('admin.dashboard.logout')}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="mx-2 sm:mx-4 shrink-0 h-14 flex items-center justify-between px-3 sm:px-7 border-b border-[--border-subtle] bg-[--bg-base]/95 backdrop-blur-sm">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden w-9 h-9 shrink-0 flex items-center justify-center text-[--text-muted] hover:text-[--text-primary]"
            >
              <Menu size={18} />
            </button>
            {currentItem && <currentItem.icon size={17} className="text-[--text-muted] shrink-0 hidden sm:block" />}
            <h1 className="text-[15px] font-semibold text-[--text-primary] truncate">{currentItem?.label || t('admin.dashboard.navDashboard')}</h1>
            <span className="h-4 w-px bg-[--border-subtle] hidden sm:block shrink-0" />
            <span className="text-[12px] text-[--text-muted] hidden sm:block truncate">{t('admin.dashboard.realDataFromMongo')}</span>
          </div>
          <div className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 font-medium shrink-0">
            {t('admin.dashboard.live')}
            </div>
        </header>

        {/* Scrollable / fill content */}
        <div className={`flex-1 ${resolvedSection === "logs" ? "overflow-hidden flex flex-col" : "overflow-y-auto"}`} id="admin-scroll-container">
          {resolvedSection === "dashboard" && (
            <DashboardSection
              stats={stats}
              revenueData={revenueData}
              revenueStats={revenueStats}
              userData={userData}
              totalUsers={dashStats?.totalUsers ?? users?.length ?? 0}
              analytics={analytics}
              growthAnalytics={growthAnalytics}
              onActiveSectionChange={setActiveDashboardSection}
            />
          )}
          {resolvedSection === "logs" && <ServerLogs />}
          {resolvedSection !== "dashboard" && resolvedSection !== "logs" && (
            <div className="p-4 sm:p-7 space-y-6">
              {resolvedSection === "users" && <UserManagement users={users} handleVerify={handleVerify} handleSuspend={handleSuspend} onRefresh={refetchAll} />}
              {resolvedSection === "lessons" && <LessonManagement />}
              {resolvedSection === "transactions" && <TransactionManagement transactions={transactions} revenueStats={revenueStats} onRefresh={refetchAll} />}
              {resolvedSection === "academy" && <AcademyManager />}
              {resolvedSection === "courses" && <CoursePricingManager />}
              {resolvedSection === "competitions" && <CompetitionManager />}
              {resolvedSection === "marketing" && <MarketingManager />}
              {resolvedSection === "plans" && <PlanManager />}
              {resolvedSection === "notifications" && <NotificationManager />}
              {resolvedSection === "user-notifications" && <NotificationAdmin />}
              {resolvedSection === "guide" && <AdminGuide />}
              {resolvedSection === "security-logs" && <SecurityLogs />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
