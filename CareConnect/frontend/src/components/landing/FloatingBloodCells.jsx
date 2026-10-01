import { motion } from 'framer-motion';

const CELLS = [
  { top: '12%', left: '8%', size: 22, delay: 0, opacity: 0.18, color: '#C41638' },
  { top: '68%', left: '5%', size: 14, delay: 1.2, opacity: 0.15, color: '#9C0F2C' },
  { top: '22%', left: '92%', size: 18, delay: 0.6, opacity: 0.16, color: '#C41638' },
  { top: '78%', left: '90%', size: 26, delay: 2, opacity: 0.14, color: '#7A0E26' },
  { top: '46%', left: '95%', size: 12, delay: 1.6, opacity: 0.2, color: '#DB2142' },
  { top: '85%', left: '30%', size: 16, delay: 0.9, opacity: 0.14, color: '#C41638' },
];

export default function FloatingBloodCells() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {CELLS.map((cell, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full blur-[1px]"
          style={{
            top: cell.top,
            left: cell.left,
            width: cell.size,
            height: cell.size,
            background: `radial-gradient(circle at 35% 30%, ${cell.color}, ${cell.color}00 72%), ${cell.color}`,
            opacity: cell.opacity,
          }}
          animate={{ y: [0, -18, 0], x: [0, 6, 0] }}
          transition={{
            duration: 7 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: cell.delay,
          }}
        />
      ))}
    </div>
  );
}
