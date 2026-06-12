import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Usage:
 *   <Breadcrumb items={[{ label: 'Luyện tập', href: '/m/voice/library' }, { label: 'Tên bài' }]} />
 * Last item = current page (no href needed).
 */
/**
 * variant="dark"  — for dark backgrounds (VoicePractice, VoiceReport, etc.)
 * variant="light" — for light/white backgrounds (default)
 */
const Breadcrumb = ({ items = [], variant = 'light' }) => {
  const crumbs = [{ label: 'Trang chủ', href: '/' }, ...items];
  const isDark = variant === 'dark';

  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1 text-[12px] mb-5 flex-wrap">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight size={12} className={isDark ? 'text-gray-500 shrink-0' : 'text-gray-400 shrink-0'} />
            )}
            {isLast || !crumb.href ? (
              <span className={`font-semibold truncate max-w-[280px] ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.href}
                className={`transition-colors flex items-center gap-1 hover:text-[#f5a623] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {i === 0 && <Home size={11} className="shrink-0" />}
                {crumb.label && <span>{crumb.label !== 'Trang chủ' ? crumb.label : ''}</span>}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
