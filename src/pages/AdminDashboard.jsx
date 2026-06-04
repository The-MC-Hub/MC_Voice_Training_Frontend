import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import {
  fetchAllUsers,
  verifyMC,
  suspendUser,
  fetchAllTransactions,
  fetchRevenueStats,
  fetchDashboardStats,
} from "../controllers/adminController";
import {
  Users, ShieldCheck, Briefcase, Zap, BookOpen, Award, LayoutGrid, CreditCard
} from "lucide-react";

import AdminOverview from "./admin/sections/AdminOverview";
import UserManagement from "./admin/sections/UserManagement";
import LessonManagement from "./admin/sections/LessonManagement";
import TransactionManagement from "./admin/sections/TransactionManagement";
import AcademyManager from "./admin/AcademyManager";
import CompetitionManager from "./admin/CompetitionManager";

const NAV_ITEMS = [
  { id: "overview",     label: "Overview",       icon: LayoutGrid },
  { id: "users",        label: "Users",          icon: Users },
  { id: "lessons",      label: "Lessons",        icon: BookOpen },
  { id: "transactions", label: "Transactions",   icon: CreditCard },
  { id: "academy",      label: "Academy",        icon: Award },
  { id: "competitions", label: "Competitions",   icon: ShieldCheck },
];

const AdminDashboard = () => {
  const { section = "overview" } = useParams();
  const navigate = useNavigate();

  const { data: users, refetch: refetchUsers } = useApi(fetchAllUsers);
  const { data: transactions } = useApi(fetchAllTransactions);
  const { data: revenueStats } = useApi(fetchRevenueStats);
  const { data: dashStats } = useApi(fetchDashboardStats);

  const handleVerify = async (id, currentStatus) => {
    const user = users?.find(u => (u._id || u.id) === id);
    const isActive = user ? user.isActive : true;
    try {
      await verifyMC(id, !currentStatus, isActive);
      refetchUsers();
    } catch {
      alert("Verification failed");
    }
  };

  const handleSuspend = async (id, currentStatus) => {
    const user = users?.find(u => (u._id || u.id) === id);
    const isVerified = user ? user.isVerified : false;
    try {
      await suspendUser(id, !currentStatus, isVerified);
      refetchUsers();
    } catch {
      alert("Suspend failed");
    }
  };

  // Monthly revenue chart data from real stats
  const revenueData = useMemo(() => {
    if (!revenueStats?.monthlyRevenue) return [];
    const monthNames = { '01':'Jan','02':'Feb','03':'Mar','04':'Apr','05':'May','06':'Jun','07':'Jul','08':'Aug','09':'Sep','10':'Oct','11':'Nov','12':'Dec' };
    return Object.entries(revenueStats.monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, revenue]) => ({
        name: monthNames[key.split('-')[1]] || key,
        month: key,
        revenue,
      }));
  }, [revenueStats]);

  const userData = useMemo(() => {
    if (!users) return [];
    const roles = users.reduce((acc, u) => {
      const roleKey = (u.role || "").toLowerCase();
      acc[roleKey] = (acc[roleKey] || 0) + 1;
      return acc;
    }, {});
    return [
      { name: 'MC', value: roles.mc || 0, color: '#3B82F6' },
      { name: 'Client', value: roles.client || 0, color: '#10B981' },
      { name: 'Admin', value: roles.admin || 0, color: '#EF4444' },
    ];
  }, [users]);

  const stats = [
    {
      label: "Tổng người dùng",
      value: dashStats?.totalUsers ?? users?.length ?? 0,
      icon: Users,
      color: "text-blue-400",
      trend: "Đã đăng ký"
    },
    {
      label: "Giao dịch thành công",
      value: dashStats?.completedTransactions ?? 0,
      icon: ShieldCheck,
      color: "text-emerald-400",
      trend: `Chờ: ${dashStats?.pendingTransactions ?? 0} · Lỗi: ${dashStats?.failedTransactions ?? 0}`
    },
    {
      label: "Tổng giao dịch",
      value: dashStats?.totalTransactions ?? transactions?.length ?? 0,
      icon: Briefcase,
      color: "text-amber-400",
      trend: "Toàn hệ thống"
    },
    {
      label: "Doanh thu thực tế",
      value: dashStats?.totalRevenue ?? revenueStats?.totalRevenue ?? 0,
      icon: Zap,
      color: "text-purple-400",
      trend: "Giao dịch hoàn thành",
      isMoney: true
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#09090b] text-white">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-white/[0.06] bg-[#09090b] sticky top-0 h-screen flex flex-col pt-8 pb-6 px-3">
        <div className="px-3 mb-6">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Admin Panel</p>
          <h2 className="text-[15px] font-semibold text-white mt-0.5">Control Center</h2>
        </div>
        <nav className="space-y-0.5 flex-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => navigate(`/m/admin/${id}`)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                section === id
                  ? 'bg-[#f5a623]/[0.08] text-[#f5a623] border border-[#f5a623]/20'
                  : 'text-zinc-500 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>
        <div className="px-3 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-zinc-500">System nominal</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 p-8 space-y-6 overflow-auto">
        <div className="pb-5 border-b border-white/[0.06]">
          <h1 className="text-xl font-semibold text-white">
            {NAV_ITEMS.find(n => n.id === section)?.label || 'Overview'}
          </h1>
          <p className="text-zinc-500 text-[12px] mt-0.5">Dữ liệu thực tế từ database.</p>
        </div>

        {section === "overview" && (
          <AdminOverview
            stats={stats}
            revenueData={revenueData}
            revenueStats={revenueStats}
            userData={userData}
            totalUsers={dashStats?.totalUsers ?? users?.length ?? 0}
          />
        )}
        {section === "users" && (
          <UserManagement users={users} handleVerify={handleVerify} handleSuspend={handleSuspend} />
        )}
        {section === "lessons" && <LessonManagement />}
        {section === "transactions" && <TransactionManagement transactions={transactions} revenueStats={revenueStats} />}
        {section === "academy" && <AcademyManager />}
        {section === "competitions" && <CompetitionManager />}
      </div>
    </div>
  );
};

export default AdminDashboard;
