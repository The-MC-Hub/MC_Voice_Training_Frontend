import { Clock, CheckCircle, XCircle, CreditCard, Ban, CheckCheck, ArrowRight } from 'lucide-react';

const statusConfig = {
  PENDING:    { label: 'Chờ xác nhận', color: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800', icon: Clock },
  ACCEPTED:   { label: 'Đã chấp nhận', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800', icon: CheckCircle },
  REJECTED:   { label: 'Đã từ chối',   color: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800', icon: XCircle },
  PAID:       { label: 'Đã thanh toán', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800', icon: CreditCard },
  CANCELLED:  { label: 'Đã hủy',       color: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-900/50 dark:text-gray-400 dark:border-gray-800', icon: Ban },
  COMPLETED:  { label: 'Hoàn thành',   color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800', icon: CheckCheck },
};

export default function BookingStatusBadge({ status, className = '' }) {
  const cfg = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-900/50 dark:text-gray-400 dark:border-gray-800', icon: ArrowRight };
  const Icon = cfg.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.color} ${className}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}
