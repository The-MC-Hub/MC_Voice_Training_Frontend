import React from "react";
import { Search, CheckCircle, XCircle, ShieldAlert, ShieldCheck, Eye, Loader2 } from "lucide-react";
import { getMCProfile } from "../../../services/publicService";

const UserManagement = ({ users, handleVerify, handleSuspend }) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedUserForDetail, setSelectedUserForDetail] = React.useState(null);
  const [mcProfileDetail, setMcProfileDetail] = React.useState(null);
  const [loadingMCProfile, setLoadingMCProfile] = React.useState(false);

  const handleOpenDetail = async (user) => {
    setSelectedUserForDetail(user);
    setMcProfileDetail(null);
    if ((user.role || "").toLowerCase() === "mc") {
      setLoadingMCProfile(true);
      try {
        const data = await getMCProfile(user._id);
        if (data?.profile) setMcProfileDetail(data.profile);
      } catch (err) {
        console.error("Failed to load MC profile details:", err);
      } finally {
        setLoadingMCProfile(false);
      }
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") setSelectedUserForDetail(null); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredUsers = React.useMemo(() => {
    if (!users) return [];
    return users.filter(u =>
      (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const roleColor = (role) => {
    const r = role?.toLowerCase();
    if (r === 'admin') return 'bg-red-950/40 text-red-400 border-red-900/40';
    if (r === 'mc') return 'bg-blue-950/40 text-blue-400 border-blue-900/40';
    return 'bg-[#09090b] text-zinc-400 border-white/[0.07]';
  };

  return (
    <div className="space-y-5 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[15px] font-semibold text-white">Registered Users Directory</h2>
          <p className="text-[12px] text-zinc-500 mt-0.5">View user registration records, suspend accounts, or certify MC profiles.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
            <Search size={14} />
          </div>
          <input
            type="text"
            placeholder="Search email, name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111113] border border-white/[0.07] rounded-xl py-2 pl-9 pr-4 text-[12px] text-white focus:outline-none focus:border-white/[0.14] placeholder:text-zinc-600"
          />
        </div>
      </div>

      <div className="bg-[#111113] border border-white/[0.07] rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-[12px]">
          <thead>
            <tr className="bg-[#09090b] border-b border-white/[0.06] text-zinc-500 uppercase text-[10px] font-semibold tracking-wider">
              <th className="px-4 py-3">User Information</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Certification</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredUsers.map(u => (
              <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-[12px] border ${roleColor(u.role)}`}>
                      {u.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <span className="font-medium text-white block">{u.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{u.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${roleColor(u.role)}`}>
                    {u.role?.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-900/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-red-950/40 text-red-400 border border-red-900/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Suspended
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {u.isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-950/40 text-blue-400 border border-blue-900/40">
                      <ShieldCheck size={11} /> Certified
                    </span>
                  ) : (
                    <span className="text-[11px] text-zinc-600 italic">Uncertified</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => handleOpenDetail(u)} title="View Profile"
                      className="p-1.5 rounded-lg bg-[#09090b] text-zinc-500 hover:text-white border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                      <Eye size={13} />
                    </button>
                    {u.role?.toLowerCase() === 'mc' && (
                      <button onClick={() => handleVerify(u._id, u.isVerified)} title={u.isVerified ? "Revoke" : "Certify"}
                        className={`p-1.5 rounded-lg border transition-colors ${u.isVerified ? "bg-blue-950/40 text-blue-400 border-blue-900/40 hover:bg-blue-900/20" : "bg-blue-600 text-white border-blue-500 hover:bg-blue-700"}`}>
                        <ShieldAlert size={13} />
                      </button>
                    )}
                    <button onClick={() => handleSuspend(u._id, u.isActive)} title={u.isActive ? "Suspend" : "Activate"}
                      className={`p-1.5 rounded-lg border transition-colors ${u.isActive ? "bg-red-950/40 text-red-400 border-red-900/40 hover:bg-red-900/20" : "bg-emerald-950/40 text-emerald-400 border-emerald-900/40 hover:bg-emerald-900/20"}`}>
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
      {selectedUserForDetail && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#111113] border border-white/[0.07] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.06]">
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider">User Account Details</p>
                <h2 className="text-[15px] font-semibold text-white mt-0.5">{selectedUserForDetail.name}</h2>
              </div>
              <button onClick={() => setSelectedUserForDetail(null)}
                className="px-3 py-1 bg-[#09090b] border border-white/[0.07] rounded-lg text-[11px] text-zinc-400 hover:text-white transition-colors">
                Close [ESC]
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 text-[12px] text-zinc-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: "User ID", value: selectedUserForDetail._id, mono: true },
                  { label: "Email Address", value: selectedUserForDetail.email },
                  { label: "Phone Number", value: selectedUserForDetail.phoneNumber || "N/A" },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="bg-[#09090b] border border-white/[0.06] rounded-xl p-4">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
                    <p className={`text-white font-medium ${mono ? 'font-mono text-[11px]' : ''}`}>{value}</p>
                  </div>
                ))}
                <div className="bg-[#09090b] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Role</p>
                  <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded-md border ${roleColor(selectedUserForDetail.role)}`}>
                    {selectedUserForDetail.role?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-white/[0.06] pt-4">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Account Status</p>
                  {selectedUserForDetail.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-900/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium bg-red-950/40 text-red-400 border border-red-900/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Suspended
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">MC Certification</p>
                  {selectedUserForDetail.isVerified ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium bg-blue-950/40 text-blue-400 border border-blue-900/40">
                      <ShieldCheck size={11} /> Certified Master of Ceremonies
                    </span>
                  ) : (
                    <span className="text-zinc-500 italic">Uncertified Talent Account</span>
                  )}
                </div>
              </div>

              {loadingMCProfile ? (
                <div className="flex flex-col items-center justify-center py-10 border-t border-white/[0.06] gap-3">
                  <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                  <p className="text-zinc-500 text-[12px]">Loading MC portfolio...</p>
                </div>
              ) : selectedUserForDetail.role?.toLowerCase() === 'mc' && mcProfileDetail ? (
                <div className="border-t border-white/[0.06] pt-5 space-y-4">
                  <h4 className="text-[12px] font-semibold text-white uppercase tracking-wider">MC Professional Portfolio</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: "Stage Name", value: mcProfileDetail.stageName || selectedUserForDetail.name },
                      { label: "Location", value: mcProfileDetail.location || "N/A" },
                      { label: "Experience", value: mcProfileDetail.experience ? `${mcProfileDetail.experience} Years` : "N/A" },
                      { label: "Starting Rate", value: mcProfileDetail.rates?.min ? `${mcProfileDetail.rates.min.toLocaleString("vi-VN")} VND` : "N/A" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">{label}</p>
                        <p className="text-white font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                  {mcProfileDetail.specialties?.length > 0 && (
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Specialties</p>
                      <div className="flex flex-wrap gap-1.5">
                        {mcProfileDetail.specialties.map(spec => (
                          <span key={spec} className="px-2 py-0.5 rounded-lg bg-[#09090b] border border-white/[0.06] text-[11px] text-zinc-300">{spec}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {mcProfileDetail.biography && (
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Biography</p>
                      <p className="text-zinc-300 leading-relaxed bg-[#09090b] border border-white/[0.06] rounded-xl p-3 max-h-36 overflow-y-auto text-[12px]">
                        {mcProfileDetail.biography}
                      </p>
                    </div>
                  )}
                </div>
              ) : selectedUserForDetail.role?.toLowerCase() === 'mc' && (
                <div className="border-t border-white/[0.06] pt-5 text-center text-zinc-500 italic text-[12px]">
                  No professional MC portfolio established.
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end">
              <button onClick={() => setSelectedUserForDetail(null)}
                className="px-4 py-2 bg-[#09090b] border border-white/[0.07] hover:border-white/[0.14] text-white rounded-xl text-[12px] font-medium transition-colors">
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
