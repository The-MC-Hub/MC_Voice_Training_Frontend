import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './animate-ui/components/radix/dropdown-menu';
import { useNotificationStore } from '../store/useNotificationStore';

const NotificationBell = ({ isDark }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

  const handleSelect = (n) => {
    if (!n.isRead) markAsRead(n.id);
    if (n.actionUrl) window.location.assign(n.actionUrl);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`relative w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
            isDark
              ? 'text-zinc-500 hover:text-white hover:bg-white/[0.07]'
              : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Thông báo</span>
          {unreadCount > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
              className="text-[11px] text-amber-600 hover:underline font-normal"
            >
              Đánh dấu đã đọc
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-2 py-6 text-center text-[13px] text-gray-400">Không có thông báo</div>
        ) : (
          notifications.slice(0, 20).map((n) => (
            <DropdownMenuItem
              key={n.id}
              onSelect={() => handleSelect(n)}
              className={!n.isRead ? 'bg-amber-50' : ''}
            >
              <div className="flex flex-col gap-0.5 w-full">
                <span className="text-[13px] font-medium">{n.title}</span>
                <span className="text-[12px] text-gray-500 line-clamp-2">{n.body}</span>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
