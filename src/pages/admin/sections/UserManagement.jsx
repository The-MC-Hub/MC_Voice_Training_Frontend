import React from "react";
import { Search, CheckCircle, XCircle, ShieldAlert, ShieldCheck, Eye, Loader2 } from "lucide-react";
import { getMCProfile } from "../../../services/publicService";

const fmtDate = (v) => {
  if (!v) return "—";
  try { return new Date(v).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }); }
  catch { return "—"; }
};

const ROLE_BADGE = {
  admin:  "bg-red-50 text-red-700 border-red-200",
  mc:     "bg-blue-50 text-blue-700 border-blue-200",
  client: "bg-gray-100 text-gray-600 border-gray-200",
};

const PLAN_BADGE = {
  FREE:   "bg-gray-100 text-gray-500 border-gray-200",
  BASIC:  "bg-blue-50 text-blue-700 border-blue-200",
  FULL:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  ANNUAL: "bg-amber-50 text-amber-700 border-amber-200",
};

const Badge = ({ cls, children }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${cls}`}>
    {children}
  </span>
);

const Field = ({ label, value, mono }) => (
  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-gray-900 font-medium text-[13px] ${mono ? "font-mono text-[11px]" : ""}`}>{value || "—"}</p>
  </div>
);

const UserManagement = ({ users, handleVerify, handleSuspend }) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterRole, setFilterRole] = React.useState("ALL");
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [mcProfile, setMcProfile] = React.useState(null);
  const [loadingProfile, setLoadingProfile] = React.useState(false);

  const openDetail = async (u) => {
    setSelectedUser(u);
    setMcProfile(null);
    if ((u.role || "").toLowerCase() === "mc") {
      setLoadingProfile(true);
      try {
        const data = await getMCProfile(u._id);
        if (data?.profile) setMcProfile(data.profile);
      } catch {}
      finally { setLoadingProfile(false); }
    }
  };

  React.useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") setSelectedUser(null); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const filtered = React.useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      const q = searchTerm.toLowerCase();
      const matchQ = !q
        || (u.name || "").toLowerCase().includes(q)
        || (u.email || "").toLowerCase().includes(q)
        || (u.phoneNumber || "").includes(q);
      const matchRole = filterRole === "ALL" || (u.role || "").toLowerCase() === filterRole.toLowerCase();
      return matchQ && matchRole;
    });
  }, [users, searchTerm, filterRole]);

  const counts = React.useMemo(() => {
    if (!users) return {};
    return users.reduce((acc, u) => {
      const r = (u.role || "client").toLowerCase();
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {});
  }, [users]);

  const roleCls = (role) => ROLE_BADGE[(role || "client").toLowerCase()] || ROLE_BADGE.client;

  return (
    <div className="space-y-6 w-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-1">
        <div>
          <h2 className="text-[16px] font-semibold text-gray-900">Quản lý người dùng</h2>
          <p className="text-[12px] text-gray-400 mt-1">
            Tổng <span className="font-semibold text-gray-700">{users?.length ?? 0}</span> tài khoản
            &nbsp;·&nbsp; <span className="text-blue-600 font-medium">{counts.mc ?? 0} MC</span>
            &nbsp;·&nbsp; <span className="text-gray-600 font-medium">{counts.client ?? 0} Client</span>
            &nbsp;·&nbsp; <span className="text-red-500 font-medium">{counts.admin ?? 0} Admin</span>
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl py-2.5 pl-9 pr-4 text-[13px] text-gray-900 focus:outline-none focus:border-gray-500 placeholder:text-gray-400 shadow-sm"
          />
        </div>
      </div>

      {/* Role filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "ALL",    label: `Tất cả`,  count: users?.length ?? 0, color: "bg-gray-900 text-white border-gray-900" },
          { key: "ADMIN",  label: "Admin",   count: counts.admin ?? 0,  color: "bg-red-600 text-white border-red-600" },
          { key: "MC",     label: "MC",      count: counts.mc ?? 0,     color: "bg-blue-600 text-white border-blue-600" },
          { key: "CLIENT", label: "Client",  count: counts.client ?? 0, color: "bg-gray-600 text-white border-gray-600" },
        ].map(({ key, label, count, color }) => (
          <button
            key={key}
            onClick={() => setFilterRole(key)}
            className={`px-4 py-2 rounded-xl text-[12px] font-semibold border transition-all shadow-sm ${
              filterRole === key
                ? color
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
            }`}
          >
            {label} <span className={`ml-1 text-[11px] font-bold ${filterRole === key ? "opacity-80" : "text-gray-400"}`}>({count})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse text-[12px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
              <th className="px-5 py-3.5">Người dùng</th>
              <th className="px-5 py-3.5">Vai trò</th>
              <th className="px-5 py-3.5">Gói</th>
              <th className="px-5 py-3.5">Trạng thái</th>
              <th className="px-5 py-3.5">Chứng nhận</th>
              <th className="px-5 py-3.5">Số điện thoại</th>
              <th className="px-5 py-3.5">Ngày đăng ký</th>
              <th className="px-5 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-[13px]">
                  Không tìm thấy người dùng
                </td>
              </tr>
            )}
            {filtered.map(u => (
              <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                {/* User info */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[13px] border shrink-0 ${roleCls(u.role)}`}>
                      {u.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 block text-[13px] leading-snug">{u.name || "—"}</span>
                      <span className="text-[11px] text-gray-400 font-mono">{u.email}</span>
                    </div>
                  </div>
                </td>
                {/* Role */}
                <td className="px-5 py-4">
                  <Badge cls={roleCls(u.role)}>{(u.role || "CLIENT").toUpperCase()}</Badge>
                </td>
                {/* Plan */}
                <td className="px-5 py-4">
                  <Badge cls={PLAN_BADGE[u.plan] || PLAN_BADGE.FREE}>{u.plan || "FREE"}</Badge>
                </td>
                {/* Status */}
                <td className="px-5 py-4">
                  {u.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /> Hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" /> Bị khóa
                    </span>
                  )}
                </td>
                {/* Certification */}
                <td className="px-5 py-4">
                  {u.isVerified ? (
                    <Badge cls="bg-blue-50 text-blue-700 border-blue-200"><ShieldCheck size={10} /> Certified</Badge>
                  ) : (
                    <span className="text-[11px] text-gray-300">—</span>
                  )}
                </td>
                {/* Phone */}
                <td className="px-5 py-4">
                  <span className="font-mono text-[12px] text-gray-600">{u.phoneNumber || "—"}</span>
                </td>
                {/* Created at */}
                <td className="px-5 py-4">
                  <span className="text-[12px] text-gray-500">{fmtDate(u.createdAt)}</span>
                </td>
                {/* Actions */}
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openDetail(u)} title="Xem chi tiết"
                      className="p-2 rounded-lg bg-white text-gray-400 hover:text-gray-700 border border-gray-200 hover:border-gray-400 transition-colors">
                      <Eye size={14} />
                    </button>
                    {u.role?.toLowerCase() === "mc" && (
                      <button onClick={() => handleVerify(u._id, u.isVerified)} title={u.isVerified ? "Thu hồi" : "Chứng nhận"}
                        className={`p-2 rounded-lg border transition-colors ${
                          u.isVerified
                            ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                            : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                        }`}>
                        <ShieldAlert size={13} />
                      </button>
                    )}
                    <button onClick={() => handleSuspend(u._id, u.isActive)} title={u.isActive ? "Khóa" : "Mở khóa"}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        u.isActive
                          ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                          : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                      }`}>
                      {u.isActive ? <XCircle size={13} /> : <CheckCircle size={13} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl flex flex-col">
            {/* Modal header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Chi tiết tài khoản</p>
                <h2 className="text-[15px] font-semibold text-gray-900 mt-0.5">{selectedUser.name}</h2>
              </div>
              <button onClick={() => setSelectedUser(null)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-[11px] text-gray-600 transition-colors">
                Đóng [ESC]
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="User ID" value={selectedUser._id} mono />
                <Field label="Email" value={selectedUser.email} />
                <Field label="Số điện thoại" value={selectedUser.phoneNumber} />
                <Field label="Ngày đăng ký" value={fmtDate(selectedUser.createdAt)} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-gray-100 pt-4">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Vai trò</p>
                  <Badge cls={roleCls(selectedUser.role)}>{(selectedUser.role || "CLIENT").toUpperCase()}</Badge>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Gói dịch vụ</p>
                  <Badge cls={PLAN_BADGE[selectedUser.plan] || PLAN_BADGE.FREE}>{selectedUser.plan || "FREE"}</Badge>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Trạng thái</p>
                  {selectedUser.isActive
                    ? <Badge cls="bg-emerald-50 text-emerald-700 border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Active</Badge>
                    : <Badge cls="bg-red-50 text-red-700 border-red-200"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> Suspended</Badge>
                  }
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Chứng nhận</p>
                  {selectedUser.isVerified
                    ? <Badge cls="bg-blue-50 text-blue-700 border-blue-200"><ShieldCheck size={10} /> Certified</Badge>
                    : <span className="text-[11px] text-gray-400 italic">Chưa</span>
                  }
                </div>
              </div>

              {/* MC Portfolio */}
              {selectedUser.role?.toLowerCase() === "mc" && (
                <div className="border-t border-gray-100 pt-5">
                  <h4 className="text-[12px] font-semibold text-gray-700 uppercase tracking-wider mb-3">Hồ sơ MC chuyên nghiệp</h4>
                  {loadingProfile ? (
                    <div className="flex items-center gap-2 py-6 justify-center text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-[12px]">Đang tải hồ sơ...</span>
                    </div>
                  ) : mcProfile ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Tên nghệ danh" value={mcProfile.stageName || selectedUser.name} />
                        <Field label="Địa điểm" value={mcProfile.location} />
                        <Field label="Kinh nghiệm" value={mcProfile.experience ? `${mcProfile.experience} năm` : null} />
                        <Field label="Mức giá khởi điểm" value={mcProfile.rates?.min ? `${mcProfile.rates.min.toLocaleString("vi-VN")} VND` : null} />
                      </div>
                      {mcProfile.specialties?.length > 0 && (
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Chuyên môn</p>
                          <div className="flex flex-wrap gap-1.5">
                            {mcProfile.specialties.map(s => (
                              <span key={s} className="px-2 py-0.5 rounded-lg bg-gray-100 border border-gray-200 text-[11px] text-gray-700">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {mcProfile.biography && (
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Tiểu sử</p>
                          <p className="text-gray-700 leading-relaxed bg-gray-50 border border-gray-100 rounded-xl p-3 max-h-36 overflow-y-auto text-[12px]">
                            {mcProfile.biography}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 italic text-[12px] py-4">Chưa có hồ sơ MC.</p>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white rounded-xl text-[12px] font-medium transition-colors">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
