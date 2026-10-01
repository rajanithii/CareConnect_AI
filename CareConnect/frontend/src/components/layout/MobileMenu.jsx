import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cx } from '../../utils/helpers';

export default function MobileMenu({ open, onClose, items = [] }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-y-0 left-0 z-[90] w-72 bg-white p-6 shadow-lift lg:hidden"
        >
          <button onClick={onClose} className="mb-6 text-ink2">
            <X size={22} />
          </button>
          <div className="space-y-1">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cx(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium',
                    isActive ? 'bg-ink text-white' : 'text-ink2 hover:bg-surface'
                  )
                }
              >
                {item.icon && <item.icon size={18} />}
                {item.label}
              </NavLink>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
