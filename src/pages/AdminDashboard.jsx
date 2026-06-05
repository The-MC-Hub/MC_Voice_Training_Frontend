import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import {
  fetchAllUsers, verifyMC, suspendUser,
  fetchAllTransactions, fetchRevenueStats,
  fetchDashboardStats, fetchAnalytics,
} from "../controllers/adminController";
import {
  Users, ShieldCheck, BookOpen, LayoutGrid, CreditCard,
  BarChart2, Award, Trophy, Settings,
} from "lucide-react";

import AdminOverview      from "./admin/sections/AdminOverview";
import AnalyticsSection   from "./admin/sections/AnalyticsSection";
import UserManagement     from "./admin/sections/UserManagement";
import LessonManagement   from "./admin/sections/LessonManagement";
import TransactionManagement from "./admin/sections/TransactionManagement";
import AcademyManager     from "./admin/AcademyManager";
import CompetitionManager from "./admin/CompetitionManager";

const NAV_ITEMS = [
  { id: "overview",     label: "Tổng quan",    icon: LayoutGrid },
  { id: "analytics",   label: "Phân tích",    icon: BarChart2 },
  { id: "users",       label: "Người dùng",   icon: Users },
  { id: "lessons",     label: "Bài học",      icon: BookOpen },
  { id: "transactions",label: "Giao dịch",    icon: CreditCard },
  { id: "academy",     label: "Academy",      icon: Award },
  { id: "competitions",label: "Thi đấu",      icon: Trophy },
];

const AdminDashboard = () => {
  const { section = "overview" } = useParams();
  const navigate = useNavigate();

  const { data: users,        refetch: refetchUsers } = useApi(fetchAllUsers);
  const { data: transactions  }                        = useApi(fetchAllTransactions);
  const { data: revenueStats  }                        = useApi(fetchRevenueStats);
  const { data: dashStats     }                        = useApi(fetchDashboardStats);
  const { data: analytics     }                        = useApi(fetchAnalytics);

  const handleVerify = async (id, cur) => {
    const u = users?.find(x => (x._id || x.id) === id);
    try { await verifyMC(id, !cur, u?.isActive ?? true); refetchUsers(); }
    catch { alert("Verification failed"); }
  };

  const handleSuspend = async (id, cur) => {
    const u = users?.find(x => (x._id || x.id) === id);
    try { await suspendUser(id, !cur, u?.isVerified ?? false); refetchUsers(); }
    catch { alert("Suspend failed"); }
  };

  const revenueData = useMemo(() => {
    if (!revenueStats?.monthlyRevenue) return [];
    const MN = {'01':'T1','02':'T2','03':'T3','04':'T4','05':'T5','06':'T6',
                 '07':'T7','08':'T8','09':'T9','10':'T10','11':'T11','12':'T12'};
    return Object.entries(revenueStats.monthlyRevenue)
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([k, revenue]) => ({ name: MN[k.split('-')[1]] || k, revenue }));
  }, [revenueStats]);

  const userData = useMemo(() => {
    if (!users) return [];
    const r = users.reduce((acc, u) => {
      const k = (u.role||"").toLowerCase();
      acc[k] = (acc[k]||0) + 1; return acc;
    }, {});
    return [
      { name: 'MC',     value: r.mc     || 0, color: '#3B82F6' },
      { name: 'Client', value: r.client || 0, color: '#10B981' },
      { name: 'Admin',  value: r.admin  || 0, color: '#f5a623' },
    ];
  }, [users]);

  const stats = [
    { label: "Tổng người dùng",      value: dashStats?.totalUsers            ?? users?.length ?? 0, icon: Users,       color: "text-blue-400",   trend: "Đã đăng ký" },
    { label: "Giao dịch thành công", value: dashStats?.completedTransactions ?? 0,                  icon: ShieldCheck, color: "text-emerald-400", trend: `Chờ: ${dashStats?.pendingTransactions??0} · Lỗi: ${dashStats?.failedTransactions??0}` },
    { label: "Tổng giao dịch",       value: dashStats?.totalTransactions     ?? transactions?.length ?? 0, icon: CreditCard, color: "text-amber-400", trend: "Toàn hệ thống" },
    { label: "Doanh thu thực tế",    value: dashStats?.totalRevenue          ?? revenueStats?.totalRevenue ?? 0, icon: BarChart2, color: "text-purple-400", trend: "Giao dịch hoàn thành", isMoney: true },
  ];

  const currentItem = NAV_ITEMS.find(n => n.id === section);

  return (
    // fixed inset-0 — escape hoàn toàn khỏi MainLayout bg-white + padding
    <div className="fixed inset-0 z-[100] flex overflow-hidden bg-[--bg-base] text-[--text-primary]">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-[220px] shrink-0 flex flex-col border-r border-[--border-subtle] bg-[--bg-surface]">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[--border-subtle]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#f5a623] flex items-center justify-center">
              <Settings size={14} className="text-black" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[--text-primary] leading-none">MCHub</p>
              <p className="text-[10px] text-[--text-muted] mt-0.5">Admin Control</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-[9px] text-[--text-muted] uppercase tracking-widest font-semibold px-3 py-2">Menu</p>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => navigate(`/m/admin/${id}`)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all text-left ${
                section === id
                  ? "bg-[#f5a623]/[0.12] text-[#f5a623] border border-[#f5a623]/20"
                  : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-elevated] border border-transparent"
              }`}
            >
              <Icon size={15} className={section === id ? "text-[#f5a623]" : ""} />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[--border-subtle]">
          <div className="flex items-center gap-2 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-[--text-muted]">Hệ thống hoạt động</span>
          </div>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="shrink-0 h-14 flex items-center justify-between px-7 border-b border-[--border-subtle] bg-[--bg-base]/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {currentItem && <currentItem.icon size={17} className="text-[--text-muted]" />}
            <h1 className="text-[15px] font-semibold text-[--text-primary]">{currentItem?.label || "Tổng quan"}</h1>
            <span className="h-4 w-px bg-[--border-subtle]" />
            <span className="text-[12px] text-[--text-muted]">Dữ liệu thực tế từ MongoDB</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 font-medium">
              Live
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-7 space-y-6">
            {section === "overview"     && <AdminOverview stats={stats} revenueData={revenueData} revenueStats={revenueStats} userData={userData} totalUsers={dashStats?.totalUsers ?? users?.length ?? 0} />}
            {section === "analytics"    && <AnalyticsSection analytics={analytics} />}
            {section === "users"        && <UserManagement users={users} handleVerify={handleVerify} handleSuspend={handleSuspend} />}
            {section === "lessons"      && <LessonManagement />}
            {section === "transactions" && <TransactionManagement transactions={transactions} revenueStats={revenueStats} />}
            {section === "academy"      && <AcademyManager />}
            {section === "competitions" && <CompetitionManager />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
