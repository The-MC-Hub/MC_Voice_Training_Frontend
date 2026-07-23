import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Send, Trash2, Search, RefreshCw, Users, MailOpen } from 'lucide-react';
import {
  getAllNotificationsAdmin,
  sendManualNotification,
  deleteNotificationAdmin,
  getNotificationStats,
} from '../../../services/notificationService';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const NOTIFICATION_TYPES = ['PAYMENT_SUCCESS', 'REPORT_RESOLVED', 'STREAK_REMINDER', 'ANNOUNCEMENT'];
const ROLES = ['CLIENT', 'MC'];

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'medium' });
};

const TYPE_COLORS = {
  PAYMENT_SUCCESS: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  REPORT_RESOLVED: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  STREAK_REMINDER: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  ANNOUNCEMENT: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

const ComposeForm = ({ t, onSent }) => {
  const [targetType, setTargetType] = useState('ALL');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('CLIENT');
  const [type, setType] = useState('ANNOUNCEMENT');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    setError('');
    if (!title.trim() || !body.trim()) {
      setError(t('admin.notificationAdmin.compose.validationRequired'));
      return;
    }
    if (targetType === 'USER' && !userId.trim()) {
      setError(t('admin.notificationAdmin.compose.validationUserId'));
      return;
    }
    if (!window.confirm(t('admin.notificationAdmin.compose.confirmSend'))) return;

    setSending(true);
    try {
      const payload = { targetType, type, title, body, actionUrl: actionUrl || undefined };
      if (targetType === 'USER') payload.userId = userId.trim();
      if (targetType === 'ROLE') payload.role = role;
      const res = await sendManualNotification(payload);
      const count = res?.data?.recipientCount ?? 0;
      setTitle('');
      setBody('');
      setActionUrl('');
      setUserId('');
      onSent(count);
    } catch (e) {
      setError(e.response?.data?.message || t('admin.notificationAdmin.compose.sendFailed'));
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="bg-[--bg-surface] border border-[--border-subtle] p-5 space-y-4 rounded-none shadow-none">
      <p className="text-[13px] font-semibold text-[--text-primary]">{t('admin.notificationAdmin.compose.title')}</p>

      {error && (
        <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-[12px]">{error}</div>
      )}

      {/* Target toggle */}
      <div className="flex items-center gap-2">
        {['USER', 'ROLE', 'ALL'].map((opt) => (
          <Button
            key={opt}
            onClick={() => setTargetType(opt)}
            className={`h-auto px-3 py-1.5 text-[12px] font-medium border transition-colors ${
              targetType === opt
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                : 'bg-[--bg-elevated] border-[--border-subtle] text-[--text-muted] hover:border-amber-500/30'
            }`}
          >
            {t(`admin.notificationAdmin.compose.target${opt.charAt(0)}${opt.slice(1).toLowerCase()}`)}
          </Button>
        ))}
      </div>

      {targetType === 'USER' && (
        <input
          type="text"
          placeholder={t('admin.notificationAdmin.compose.userIdPlaceholder')}
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full px-3 py-2 bg-[--bg-elevated] border border-[--border-subtle] text-[13px] text-[--text-primary] outline-none focus:border-amber-500/40"
        />
      )}

      {targetType === 'ROLE' && (
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-3 py-2 bg-[--bg-elevated] border border-[--border-subtle] text-[13px] text-[--text-primary] outline-none focus:border-amber-500/40"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      )}

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full px-3 py-2 bg-[--bg-elevated] border border-[--border-subtle] text-[13px] text-[--text-primary] outline-none focus:border-amber-500/40"
      >
        {NOTIFICATION_TYPES.map((nt) => (
          <option key={nt} value={nt}>{nt}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder={t('admin.notificationAdmin.compose.titlePlaceholder')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-2 bg-[--bg-elevated] border border-[--border-subtle] text-[13px] text-[--text-primary] outline-none focus:border-amber-500/40"
      />

      <textarea
        placeholder={t('admin.notificationAdmin.compose.bodyPlaceholder')}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 bg-[--bg-elevated] border border-[--border-subtle] text-[13px] text-[--text-primary] outline-none focus:border-amber-500/40 resize-none"
      />

      <input
        type="text"
        placeholder={t('admin.notificationAdmin.compose.actionUrlPlaceholder')}
        value={actionUrl}
        onChange={(e) => setActionUrl(e.target.value)}
        className="w-full px-3 py-2 bg-[--bg-elevated] border border-[--border-subtle] text-[13px] text-[--text-primary] outline-none focus:border-amber-500/40"
      />

      <Button
        onClick={handleSend}
        disabled={sending}
        className="h-auto flex items-center gap-1.5 px-4 py-2 bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[12px] font-medium hover:bg-amber-500/25 transition-colors disabled:opacity-50"
      >
        {sending
          ? <span className="w-3 h-3 border border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          : <Send size={13} />}
        {t('admin.notificationAdmin.compose.send')}
      </Button>
    </Card>
  );
};

const NotificationAdmin = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterRead, setFilterRead] = useState('ALL');
  const [sentBanner, setSentBanner] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getAllNotificationsAdmin(), getNotificationStats()])
      .then(([listRes, statsRes]) => {
        setNotifications(listRes?.data || []);
        setStats(statsRes?.data || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.notificationAdmin.confirmDelete'))) return;
    try {
      await deleteNotificationAdmin(id);
      load();
    } catch (e) {
      alert(e.response?.data?.message || t('admin.notificationAdmin.deleteFailed'));
    }
  };

  const handleSent = (count) => {
    setSentBanner(t('admin.notificationAdmin.sentBanner', { count }));
    setTimeout(() => setSentBanner(null), 4000);
    load();
  };

  const filtered = notifications.filter((n) => {
    if (filterType !== 'ALL' && n.type !== filterType) return false;
    if (filterRead === 'READ' && !n.isRead) return false;
    if (filterRead === 'UNREAD' && n.isRead) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (n.title || '').toLowerCase().includes(q) ||
        (n.body || '').toLowerCase().includes(q) ||
        (n.userId || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[18px] font-bold text-[--text-primary] flex items-center gap-2">
            <Bell size={18} className="text-amber-500" /> {t('admin.notificationAdmin.title')}
          </h2>
          <p className="text-[12px] text-[--text-muted] mt-1">{t('admin.notificationAdmin.recordsCount', { count: notifications.length })}</p>
        </div>
        <Button onClick={load}
          className="h-auto flex items-center gap-1.5 px-3 py-2 border border-[--border-subtle] text-[12px] text-[--text-secondary] hover:border-amber-500/40 transition-colors">
          <RefreshCw size={13} /> {t('admin.notificationAdmin.reload')}
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="bg-[--bg-surface] border border-[--border-subtle] p-5 flex items-center gap-4 rounded-none shadow-none">
            <div className="w-10 h-10 bg-[--bg-elevated] border border-[--border-subtle] flex items-center justify-center shrink-0">
              <Bell size={18} className="text-[--text-muted]" />
            </div>
            <div>
              <p className="text-[22px] font-bold text-[--text-primary] leading-none">{(stats.totalCount ?? 0).toLocaleString()}</p>
              <p className="text-[11px] text-[--text-muted] mt-1">{t('admin.notificationAdmin.stats.total')}</p>
            </div>
          </Card>
          <Card className="bg-[--bg-surface] border border-[--border-subtle] p-5 flex items-center gap-4 rounded-none shadow-none">
            <div className="w-10 h-10 bg-[--bg-elevated] border border-[--border-subtle] flex items-center justify-center shrink-0">
              <MailOpen size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-[22px] font-bold text-[--text-primary] leading-none">{(stats.unreadCount ?? 0).toLocaleString()}</p>
              <p className="text-[11px] text-[--text-muted] mt-1">{t('admin.notificationAdmin.stats.unread')}</p>
            </div>
          </Card>
          <Card className="bg-[--bg-surface] border border-[--border-subtle] p-5 flex items-center gap-4 rounded-none shadow-none">
            <div className="w-10 h-10 bg-[--bg-elevated] border border-[--border-subtle] flex items-center justify-center shrink-0">
              <Users size={18} className="text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-[--text-muted] mb-1">{t('admin.notificationAdmin.stats.byType')}</p>
              <p className="text-[11px] text-[--text-primary] leading-relaxed">
                {Object.entries(stats.byType || {}).map(([k, v]) => `${k}: ${v}`).join(' · ')}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Compose */}
      <ComposeForm t={t} onSent={handleSent} />

      {sentBanner && (
        <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[12px]">
          {sentBanner}
        </div>
      )}

      {/* Filters row */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 bg-[--bg-surface] border border-[--border-subtle] focus-within:border-amber-500/40">
          <Search size={13} className="text-[--text-muted] shrink-0" />
          <input
            type="text" placeholder={t('admin.notificationAdmin.searchPlaceholder')}
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none flex-1 text-[13px] text-[--text-primary] placeholder:text-[--text-muted]"
          />
        </div>

        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 bg-[--bg-surface] border border-[--border-subtle] text-[12px] text-[--text-secondary] outline-none hover:border-amber-500/40 transition-colors">
          <option value="ALL">{t('admin.notificationAdmin.allTypes')}</option>
          {NOTIFICATION_TYPES.map((nt) => <option key={nt} value={nt}>{nt}</option>)}
        </select>

        <select value={filterRead} onChange={(e) => setFilterRead(e.target.value)}
          className="px-3 py-2 bg-[--bg-surface] border border-[--border-subtle] text-[12px] text-[--text-secondary] outline-none hover:border-amber-500/40 transition-colors">
          <option value="ALL">{t('admin.notificationAdmin.allStatuses')}</option>
          <option value="READ">{t('admin.notificationAdmin.readOnly')}</option>
          <option value="UNREAD">{t('admin.notificationAdmin.unreadOnly')}</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-16 text-center text-[12px] text-[--text-muted]">{t('admin.notificationAdmin.loading')}</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-[12px] text-[--text-muted]">{t('admin.notificationAdmin.noRecords')}</div>
      ) : (
        <div className="overflow-x-auto border border-[--border-subtle]">
          <Table className="w-full min-w-[700px]">
            <TableHeader>
              <TableRow className="border-b border-[--border-subtle] bg-[--bg-surface] hover:bg-[--bg-surface]">
                {[
                  t('admin.notificationAdmin.colTime'),
                  t('admin.notificationAdmin.colType'),
                  t('admin.notificationAdmin.colUser'),
                  t('admin.notificationAdmin.colTitle'),
                  t('admin.notificationAdmin.colStatus'),
                  '',
                ].map((h) => (
                  <TableHead key={h} className="px-4 py-3 h-auto text-left text-[10px] text-[--text-muted] uppercase tracking-widest font-semibold">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((n) => (
                <TableRow key={n.id} className="border-b border-[--border-subtle] last:border-0">
                  <TableCell className="px-4 py-3 text-[12px] text-[--text-secondary] whitespace-nowrap">{fmtDate(n.createdAt)}</TableCell>
                  <TableCell className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-medium border ${TYPE_COLORS[n.type] || 'text-[--text-muted] bg-[--bg-elevated] border-[--border-subtle]'}`}>
                      {n.type}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[12px] text-[--text-secondary] font-mono">{n.userId}</TableCell>
                  <TableCell className="px-4 py-3 text-[12px] text-[--text-primary] max-w-[260px] truncate">{n.title}</TableCell>
                  <TableCell className="px-4 py-3">
                    <span className={`text-[10px] font-medium ${n.isRead ? 'text-[--text-muted]' : 'text-amber-400'}`}>
                      {n.isRead ? t('admin.notificationAdmin.readOnly') : t('admin.notificationAdmin.unreadOnly')}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Button
                      onClick={() => handleDelete(n.id)}
                      className="h-auto p-1.5 text-[--text-muted] hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default NotificationAdmin;
