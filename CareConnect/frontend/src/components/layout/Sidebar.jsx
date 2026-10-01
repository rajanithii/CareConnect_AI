import { NavLink } from 'react-router-dom';
import { cx } from '../../utils/helpers';

export default function Sidebar({ items = [], footer }) {
  return (
    <aside className="hidden h-screen w-[260px] shrink-0 flex-col border-r border-line bg-white/60 backdrop-blur-xl lg:flex sticky top-0">
      <div className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cx(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-colors',
                isActive
                  ? 'bg-ink text-white'
                  : 'text-ink2 hover:bg-surface hover:text-ink'
              )
            }
          >
            {item.icon && <item.icon size={18} />}
            {item.label}
          </NavLink>
        ))}
      </div>
      {footer && <div className="border-t border-line p-4">{footer}</div>}
    </aside>
  );
}
