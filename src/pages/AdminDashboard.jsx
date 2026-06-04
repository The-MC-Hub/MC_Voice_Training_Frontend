import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import {
  fetchAllUsers, verifyMC, suspendUser,
  fetchAllTransactions, fetchRevenueStats,
  fetchDashboardStats, fetchAnalytics,
} from "../controllers/adminController";
import {
  Users, ShieldCheck, BookOpen, LayoutGrid, CreditCard, BarChart2, Award, Trophy
} from "lucide-react";

import AdminOverview    from "./admin/sections/AdminOverview";
import AnalyticsSection from "./admin/sections/AnalyticsSection";
import UserManagement   from "./admin/sections/UserManagement";
import LessonManagement from "./admin/sections/LessonManagement";
import TransactionManagement from "./admin/sections/TransactionManagement";
import AcademyManager   from "./admin/AcademyManager";
import CompetitionManager from "./admin/CompetitionManager";

const NAV_ITEMS = [
  { id: "overview",     label: "Tổng quan",     icon: LayoutGrid },
  { id: "analytics",    label: "Phân tích",     icon: BarChart2 },
  { id: "users",        label: "Người dùng",    icon: Users },
  { id: "lessons",      label: "Bài học",       icon: BookOpen },
  { id: "transactions", label: "Giao dịch",     icon: CreditCard },
  { id: "academy",      label: "Academy",       icon: Award },
  { id: "competitions", label: "Competitions",  icon: Trophy },
];

const AdminDashboard = () => {
  const { section = "overview" } = useParams();
  const navigate = useNavigate();

  const { data: users,        refetch: refetchUsers } = useApi(fetchAllUsers);
  const { data: transactions                        } = useApi(fetchAllTransactions);
  const { data: revenueStats                        } = useApi(fetchRevenueStats);
  const { data: dashStats                           } = useApi(fetchDashboardStats);
  const { data: analytics                           } = useApi(fetchAnalytics);

  const handleVerify = async (id, currentStatus) => {
    const user = users?.find(u => (u._id || u.id) === id);
    try { await verifyMC(id, !currentStatus, user?.isActive ?? true); refetchUsers(); }
    catch { alert("Verification failed"); }
  };

  const handleSuspend = async (id, currentStatus) => {
    const user = users?.find(u => (u._id || u.id) === id);
    try { await suspendUser(id, !currentStatus, user?.isVerified ?? false); refetchUsers(); }
    catch { alert("Suspend failed"); }
  };

  const revenueData = useMemo(() => {
    if (!revenueStats?.monthlyRevenue) return [];
    const MN = { '01':'T1','02':'T2','03':'T3','04':'T4','05':'T5','06':'T6','07':'T7','08':'T8','09':'T9','10':'T10','11':'T11','12':'T12' };
    return Object.entries(revenueStats.monthlyRevenue)
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([k, revenue]) => ({ name: MN[k.split('-')[1]] || k, month: k, revenue }));
  }, [revenueStats]);

  const userData = useMemo(() => {
    if (!users) return [];
    const roles = users.reduce((acc, u) => { const r = (u.role||"").toLowerCase(); acc[r] = (acc[r]||0)+1; return acc; }, {});
    return [
      { name: 'MC',     value: roles.mc     || 0, color: '#3B82F6' },
      { name: 'Client', value: roles.client || 0, color: '#10B981' },
      { name: 'Admin',  value: roles.admin  || 0, color: '#EF4444' },
    ];
  }, [users]);

  const stats = [
    { label: "Tổng người dùng",       value: dashStats?.totalUsers        ?? users?.length ?? 0, icon: Users,       color: "text-blue-400",   trend: "Đã đăng ký" },
    { label: "Giao dịch thành công",  value: dashStats?.completedTransactions ?? 0,              icon: ShieldCheck, color: "text-emerald-400", trend: `Chờ: ${dashStats?.pendingTransactions??0} · Lỗi: ${dashStats?.failedTransactions??0}` },
    { label: "Tổng giao dịch",        value: dashStats?.totalTransactions  ?? transactions?.length ?? 0, icon: CreditCard, color: "text-amber-400", trend: "Toàn hệ thống" },
    { label: "Doanh thu thực tế",     value: dashStats?.totalRevenue       ?? revenueStats?.totalRevenue ?? 0, icon: BarChart2, color: "text-purple-400", trend: "Giao dịch hoàn thành", isMoney: true },
  ];

  const currentLabel = NAV_ITEMS.find(n => n.id === section)?.label || 'Tổng quan';

  return (
    <div className="flex min-h-screen bg-[#09090b] text-white">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 border-r border-white/[0.06] bg-[#09090b] sticky top-0 h-screen flex flex-col pt-6 pb-5 px-2">
        <div className="px-3 mb-5">
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-medium">Admin Panel</p>
          <h2 className="text-[14px] font-semibold text-white mt-0.5">Control Center</h2>
        </div>
        <nav className="space-y-0.5 flex-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => navigate(`/m/admin/${id}`)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
                section === id
                  ? 'bg-[#f5a623]/[0.1] text-[#f5a623] border border-[#f5a623]/25'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>
        <div className="px-3 pt-4 border-t border-white/[0.05]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-zinc-600">Hệ thống hoạt động</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-auto">
        {/* Page header */}
        <div className="sticky top-0 z-10 bg-[#09090b]/95 backdrop-blur-sm border-b border-white/[0.06] px-8 py-4">
          <h1 className="text-[16px] font-semibold text-white">{currentLabel}</h1>
          <p className="text-zinc-600 text-[11px] mt-0.5">Dữ liệu thực tế từ MongoDB — cập nhật realtime.</p>
        </div>

        <div className="p-8 space-y-6">
          {section === "overview" && (
            <AdminOverview
              stats={stats}
              revenueData={revenueData}
              revenueStats={revenueStats}
              userData={userData}
              totalUsers={dashStats?.totalUsers ?? users?.length ?? 0}
            />
          )}
          {section === "analytics" && (
            <AnalyticsSection analytics={analytics} />
          )}
          {section === "users" && (
            <UserManagement users={users} handleVerify={handleVerify} handleSuspend={handleSuspend} />
          )}
          {section === "lessons" && <LessonManagement />}
          {section === "transactions" && (
            <TransactionManagement transactions={transactions} revenueStats={revenueStats} />
          )}
          {section === "academy"      && <AcademyManager />}
          {section === "competitions" && <CompetitionManager />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
