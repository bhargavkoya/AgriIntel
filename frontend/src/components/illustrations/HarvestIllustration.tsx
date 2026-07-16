import { motion } from 'framer-motion';

const STALKS = [72, 100, 128];
const ROWS = [0, 1, 2, 3];

function HarvestIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="95" className="fill-accent/10" />
      <path d="M35 165 L165 165 L165 178 L35 178 Z" className="fill-primary/20" />
      {STALKS.map((x, i) => (
        <motion.g
          key={x}
          style={{ transformOrigin: `${x}px 165px` }}
          animate={{ rotate: [0, i % 2 === 0 ? 6 : -6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut', delay: i * 0.15 }}
        >
          <line x1={x} y1="165" x2={x} y2="58" stroke="currentColor" className="text-primary" strokeWidth="4" strokeLinecap="round" />
          {ROWS.map((row) => {
            const y = 66 + row * 17;
            return (
              <g key={row}>
                <ellipse cx={x - 8} cy={y} rx="9" ry="5" className="fill-accent" transform={`rotate(-32 ${x - 8} ${y})`} />
                <ellipse cx={x + 8} cy={y} rx="9" ry="5" className="fill-accent" transform={`rotate(32 ${x + 8} ${y})`} />
              </g>
            );
          })}
        </motion.g>
      ))}
    </svg>
  );
}

export default HarvestIllustration;
