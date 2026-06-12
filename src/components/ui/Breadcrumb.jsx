import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Usage:
 *   <Breadcrumb items={[{ label: 'Luyện tập', href: '/m/voice/library' }, { label: 'Tên bài' }]} />
 * Last item = current page (no href needed).
 */
const Breadcrumb = ({ items = [] }) => {
  const crumbs = [{ label: 'Trang chủ', href: '/' }, ...items];

  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1 text-[12px] mb-5 flex-wrap">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={12} className="text-zinc-700 shrink-0" />}
            {isLast ? (
              <span className="text-zinc-400 font-medium truncate max-w-[200px]">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.href}
                className="text-zinc-600 hover:text-[#f5a623] transition-colors flex items-center gap-1"
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
