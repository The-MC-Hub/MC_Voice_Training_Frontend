import React, { useEffect, useState, useCallback } from 'react';
import {
  Shield, RefreshCw, Trash2, Search, AlertTriangle,
  CheckCircle, XCircle, ChevronDown, ChevronUp, Filter
} from 'lucide-react';
import api from '../../../services/api';

const ACTION_LABELS = {
  AUTH_LOGIN: 'Đăng nhập',
  AUTH_LOGOUT: 'Đăng xuất',
  AUTH_REGISTER: 'Đăng ký',
  AUTH_CHANGE_PASSWORD: 'Đổi mật khẩu',
  AUTH_RESET_PASSWORD: 'Reset mật khẩu',
  ADMIN_LOGIN_OTP_VERIFY: 'Admin OTP xác nhận',
  ADMIN_DELETE_USER: 'Xóa người dùng',
  ADMIN_UPDATE_USER_STATUS: 'Cập nhật trạng thái',
  ADMIN_CHANGE_PASSWORD: 'Admin đổi mật khẩu',
  ADMIN_CREATE_USER: 'Tạo người dùng',
  ADMIN_SEND_RESET_EMAIL: 'Gửi email reset',
  ADMIN_NOTIFY_EMAIL: 'Gửi thông báo email',
  ADMIN_MIGRATE_DB: 'Migrate database',
  ADMIN_PURGE_LOGS: 'Xóa logs cũ',
  ADMIN_BAN_USER: 'Khóa tài khoản',
  ADMIN_UNBAN_USER: 'Mở khóa tài khoản',
  PAYMENT_INITIATE: 'Khởi tạo thanh toán',
  PAYMENT_SUCCESS: 'Thanh toán thành công',
  PAYMENT_FAILED: 'Thanh toán thất bại',
  PROFILE_UPDATE: 'Cập nhật hồ sơ',
};

const ACTION_COLORS = {
  AUTH_LOGIN: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  ADMIN_DELETE_USER: 'text-red-400 bg-red-500/10 border-red-500/20',
  ADMIN_UPDATE_USER_STATUS: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  ADMIN_CHANGE_PASSWORD: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  ADMIN_MIGRATE_DB: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  ADMIN_PURGE_LOGS: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  PAYMENT_SUCCESS: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  PAYMENT_FAILED: 'text-red-400 bg-red-500/10 border-red-500/20',
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'medium' });
};

const truncateUA = (ua) => {
  if (!ua) return '—';
  const m = ua.match(/\(([^)]+)\)/);
  return m ? m[1].split(';')[0].trim() : ua.slice(0, 40);
};

const LogRow = ({ log }) => {
  const [expanded, setExpanded] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const actionColor = ACTION_COLORS[log.action] || 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
  const isFailed = log.status === 'FAILED';

  const handleExpand = () => {
    setExpanded(e => !e);
    if (!expanded && log.userId && !userInfo) {
      setUserLoading(true);
      api.get(`/admin/users/${log.userId}`)
        .then(res => setUserInfo(res.data?.data || null))
        .catch(() => setUserInfo(null))
        .finally(() => setUserLoading(false));
    }
  };

  return (
    <>
      <tr
        className={`border-b border-[--border-subtle] hover:bg-[--bg-elevated] transition-colors cursor-pointer ${isFailed ? 'bg-red-500/[0.03]' : ''}`}
        onClick={handleExpand}
      >
        <td className="px-4 py-3 text-[11px] text-[--text-muted] font-mono whitespace-nowrap">
          {fmtDate(log.createdAt)}
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] font-semibold uppercase tracking-wide ${actionColor}`}>
            {ACTION_LABELS[log.action] || log.action}
          </span>
        </td>
        <td className="px-4 py-3 text-[12px] text-[--text-secondary] font-mono">{log.ipAddress || '—'}</td>
        <td className="px-4 py-3 text-[11px] text-[--text-muted] max-w-[160px] truncate" title={log.userAgent}>
          {truncateUA(log.userAgent)}
        </td>
        <td className="px-4 py-3">
          {isFailed
            ? <span className="flex items-center gap-1 text-red-400 text-[11px]"><XCircle size={11} /> Thất bại</span>
            : <span className="flex items-center gap-1 text-emerald-400 text-[11px]"><CheckCircle size={11} /> Thành công</span>
          }
        </td>
        <td className="px-4 py-3 text-[11px] text-[--text-muted] font-mono max-w-[120px] truncate">{log.userId || '—'}</td>
        <td className="px-3 py-3 text-[--text-muted]">
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-[--bg-elevated] border-b border-[--border-subtle]">
          <td colSpan={7} className="px-6 py-4">
            <div className="space-y-4 text-[12px]">

              {/* User Info Panel */}
              {log.userId && (
                <div className="p-3 bg-[--bg-base] border border-[--border-subtle] rounded-lg">
                  <p className="text-[10px] text-[--text-muted] uppercase tracking-widest mb-2">Thông tin người dùng</p>
                  {userLoading ? (
                    <p className="text-[--text-muted] text-[11px]">Đang tải...</p>
                  ) : userInfo ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-[10px] text-[--text-muted] mb-0.5">Họ tên</p>
                        <p className="text-[--text-primary] font-medium">{userInfo.name || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[--text-muted] mb-0.5">Email</p>
                        <p className="text-[--text-secondary] font-mono">{userInfo.email || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[--text-muted] mb-0.5">Số điện thoại</p>
                        <p className="text-[--text-secondary]">{userInfo.phoneNumber || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[--text-muted] mb-0.5">Vai trò</p>
                        <p className="text-[--text-secondary]">{userInfo.role || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[--text-muted] mb-0.5">Trạng thái</p>
                        <p className={userInfo.isActive ? 'text-emerald-400' : 'text-red-400'}>
                          {userInfo.isActive ? 'Hoạt động' : 'Bị khóa'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[--text-muted] mb-0.5">Gói</p>
                        <p className="text-[--text-secondary]">{userInfo.plan || 'FREE'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[--text-muted] mb-0.5">Đăng ký</p>
                        <p className="text-[--text-secondary]">{userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleDateString('vi-VN') : '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[--text-muted] mb-0.5">User ID</p>
                        <p className="text-[--text-muted] font-mono text-[10px]">{log.userId}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[--text-muted] text-[11px]">Không tìm thấy thông tin người dùng (có thể đã bị xóa)</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-[--text-muted] uppercase tracking-widest mb-1">User Agent</p>
                  <p className="text-[--text-secondary] break-all">{log.userAgent || '—'}</p>
                </div>
                {log.resourceId && (
                  <div>
                    <p className="text-[10px] text-[--text-muted] uppercase tracking-widest mb-1">Resource ID</p>
                    <p className="text-[--text-secondary] font-mono">{log.resource} / {log.resourceId}</p>
                  </div>
                )}
                {log.details && (
                  <div className="md:col-span-2">
                    <p className="text-[10px] text-[--text-muted] uppercase tracking-widest mb-1">Details</p>
                    <pre className="text-[--text-secondary] bg-[--bg-base] p-2 rounded-lg overflow-x-auto text-[11px]">
                      {(() => { try { return JSON.stringify(JSON.parse(log.details), null, 2); } catch { return log.details; } })()}
                    </pre>
                  </div>
                )}
                {log.errorMessage && (
                  <div className="md:col-span-2">
                    <p className="text-[10px] text-[--text-muted] uppercase tracking-widest mb-1">Lỗi</p>
                    <p className="text-red-400 font-mono text-[11px]">{log.errorMessage}</p>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const SecurityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterAction, setFilterAction] = useState('ALL');
  const [purgeDays, setPurgeDays] = useState(30);
  const [purging, setPurging] = useState(false);
  const [purgeResult, setPurgeResult] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/audit-logs')
      .then(res => setLogs(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePurge = async () => {
    if (purgeDays < 3) { alert('Không thể xóa log dưới 3 ngày gần nhất.'); return; }
    if (!window.confirm(
      `Xóa tất cả log cũ hơn ${purgeDays} ngày?\n\nLog 3 ngày gần nhất sẽ được giữ lại bất kể cài đặt.\nHành động này không thể hoàn tác.`
    )) return;
    setPurging(true);
    try {
      const res = await api.delete(`/audit-logs/purge?days=${purgeDays}`);
      const data = res.data?.data;
      setPurgeResult(`Đã xóa ${data?.deleted ?? 0} bản ghi (cũ hơn ${data?.olderThanDays ?? purgeDays} ngày).`);
      load();
    } catch (e) {
      alert('Purge thất bại: ' + (e.response?.data?.message || e.message));
    } finally {
      setPurging(false);
    }
  };

  const uniqueActions = [...new Set(logs.map(l => l.action))].sort();

  const filtered = logs.filter(l => {
    if (filterStatus !== 'ALL' && l.status !== filterStatus) return false;
    if (filterAction !== 'ALL' && l.action !== filterAction) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (l.ipAddress || '').includes(q) ||
        (l.userId || '').toLowerCase().includes(q) ||
        (l.action || '').toLowerCase().includes(q) ||
        (l.userAgent || '').toLowerCase().includes(q) ||
        (l.resourceId || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const failedCount = logs.filter(l => l.status === 'FAILED').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[18px] font-bold text-[--text-primary] flex items-center gap-2">
            <Shield size={18} className="text-amber-500" /> Security Logs
          </h2>
          <p className="text-[12px] text-[--text-muted] mt-1">
            {logs.length} bản ghi · {failedCount > 0 && (
              <span className="text-red-400 font-medium">{failedCount} thất bại</span>
            )}
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-1.5 px-3 py-2 border border-[--border-subtle] text-[12px] text-[--text-secondary] hover:border-amber-500/40 transition-colors">
          <RefreshCw size={13} /> Tải lại
        </button>
      </div>

      {/* Purge banner */}
      {purgeResult && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[12px]">
          <CheckCircle size={13} /> {purgeResult}
          <button onClick={() => setPurgeResult(null)} className="ml-auto text-emerald-400/60 hover:text-emerald-400"><XCircle size={13} /></button>
        </div>
      )}

      {/* Filters row */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 bg-[--bg-surface] border border-[--border-subtle] focus-within:border-amber-500/40">
          <Search size={13} className="text-[--text-muted] shrink-0" />
          <input
            type="text" placeholder="Tìm IP, userId, action..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none flex-1 text-[13px] text-[--text-primary] placeholder:text-[--text-muted]"
          />
        </div>

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-[--bg-surface] border border-[--border-subtle] text-[12px] text-[--text-secondary] outline-none hover:border-amber-500/40 transition-colors">
          <option value="ALL">Tất cả trạng thái</option>
          <option value="SUCCESS">Thành công</option>
          <option value="FAILED">Thất bại</option>
        </select>

        <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
          className="px-3 py-2 bg-[--bg-surface] border border-[--border-subtle] text-[12px] text-[--text-secondary] outline-none hover:border-amber-500/40 transition-colors max-w-[200px]">
          <option value="ALL">Tất cả hành động</option>
          {uniqueActions.map(a => (
            <option key={a} value={a}>{ACTION_LABELS[a] || a}</option>
          ))}
        </select>

        {/* Purge control */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1.5 text-[12px] text-[--text-muted]">
            <Trash2 size={12} className="text-rose-400" />
            <span>Xóa log cũ hơn</span>
            <input
              type="number" min={3} max={365} value={purgeDays}
              onChange={e => setPurgeDays(Number(e.target.value))}
              className="w-14 px-2 py-1 bg-[--bg-surface] border border-[--border-subtle] text-[12px] text-[--text-primary] outline-none focus:border-rose-500/40 text-center"
            />
            <span>ngày</span>
          </div>
          <button
            onClick={handlePurge} disabled={purging}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[12px] font-medium hover:bg-rose-500/20 hover:border-rose-500/50 transition-colors disabled:opacity-50">
            {purging
              ? <span className="w-3 h-3 border border-rose-400/30 border-t-rose-400 rounded-full animate-spin" />
              : <Trash2 size={12} />}
            Purge
          </button>
        </div>
      </div>

      {/* Warning: min 3 days */}
      <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-500/[0.06] border border-amber-500/20 text-[11px] text-amber-400/80">
        <AlertTriangle size={12} className="shrink-0 mt-0.5" />
        <span>
          Log của <strong>3 ngày gần nhất</strong> không thể bị xóa dù cài đặt bất kỳ giá trị nào — nhằm đảm bảo có thể truy vết nếu có xâm nhập gần đây.
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-16 text-center text-[12px] text-[--text-muted]">Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-[12px] text-[--text-muted]">Không có bản ghi nào.</div>
      ) : (
        <div className="overflow-x-auto border border-[--border-subtle]">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-[--border-subtle] bg-[--bg-surface]">
                {['Thời gian', 'Hành động', 'IP', 'Thiết bị', 'Trạng thái', 'User ID', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] text-[--text-muted] uppercase tracking-widest font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => <LogRow key={log.id} log={log} />)}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-[--border-subtle] text-[11px] text-[--text-muted] bg-[--bg-surface]">
            Hiển thị {filtered.length} / {logs.length} bản ghi
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityLogs;
