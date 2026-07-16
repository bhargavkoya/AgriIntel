import { motion } from 'framer-motion';

const nodTransition = {
  duration: 1.1,
  repeat: Infinity,
  repeatDelay: 2.4,
  ease: 'easeInOut' as const,
};

function BullHead({ cx, cy, scale = 1 }: { cx: number; cy: number; scale?: number }) {
  return (
    <motion.g
      style={{ transformOrigin: `${cx}px ${cy + 10}px` }}
      animate={{ rotate: [0, -12, 0, -10, 0] }}
      transition={nodTransition}
    >
      <path
        d={`M${cx - 8} ${cy - 10} Q${cx - 14} ${cy - 20} ${cx - 10} ${cy - 24}`}
        stroke="currentColor"
        className="text-primary"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M${cx + 4} ${cy - 12} Q${cx + 12} ${cy - 20} ${cx + 10} ${cy - 26}`}
        stroke="currentColor"
        className="text-primary"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx={cx} cy={cy} rx={13 * scale} ry={11 * scale} className="fill-primary" />
      <circle cx={cx + 8 * scale} cy={cy - 1} r={1.6} className="fill-card" />
    </motion.g>
  );
}

function FarmerCartIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 240" className={className} aria-hidden="true">
      <circle cx="200" cy="128" r="118" className="fill-primary/8" />
      <circle cx="335" cy="58" r="22" className="fill-accent/25" />
      <circle cx="60" cy="60" r="10" className="fill-accent/20" />

      <path d="M20 206 Q200 190 380 206 L380 216 Q200 200 20 216 Z" className="fill-primary/15" />

      {/* Bulls */}
      <g>
        {/* back bull */}
        <ellipse cx="102" cy="140" rx="30" ry="16" className="fill-primary/75" />
        <line x1="82" y1="154" x2="80" y2="172" stroke="currentColor" className="text-primary/75" strokeWidth="4" strokeLinecap="round" />
        <line x1="122" y1="154" x2="124" y2="172" stroke="currentColor" className="text-primary/75" strokeWidth="4" strokeLinecap="round" />
        <BullHead cx={64} cy={128} scale={0.9} />

        {/* front bull */}
        <ellipse cx="96" cy="158" rx="33" ry="18" className="fill-primary" />
        <line x1="74" y1="174" x2="72" y2="194" stroke="currentColor" className="text-primary" strokeWidth="4" strokeLinecap="round" />
        <line x1="118" y1="174" x2="120" y2="194" stroke="currentColor" className="text-primary" strokeWidth="4" strokeLinecap="round" />
        <path d="M126 152 Q140 158 132 170" stroke="currentColor" className="text-primary" strokeWidth="3" strokeLinecap="round" fill="none" />
        <BullHead cx={55} cy={146} />
      </g>

      {/* Yoke pole */}
      <line x1="182" y1="146" x2="66" y2="146" stroke="currentColor" className="text-accent" strokeWidth="4" strokeLinecap="round" />

      {/* Cart */}
      <motion.g
        style={{ transformOrigin: '212px 182px' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
      >
        <circle cx="212" cy="182" r="22" className="fill-none stroke-accent" strokeWidth="4" />
        <circle cx="212" cy="182" r="4" className="fill-accent" />
        {[0, 60, 120].map((deg) => (
          <line
            key={deg}
            x1="212"
            y1="182"
            x2={212 + 20 * Math.cos((deg * Math.PI) / 180)}
            y2={182 + 20 * Math.sin((deg * Math.PI) / 180)}
            stroke="currentColor"
            className="text-accent"
            strokeWidth="2.5"
          />
        ))}
      </motion.g>

      <rect x="182" y="118" width="115" height="34" rx="5" className="fill-accent/70" />
      <rect x="285" y="96" width="10" height="56" rx="3" className="fill-accent/70" />

      {/* Farmer */}
      <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
        <line x1="222" y1="106" x2="182" y2="144" stroke="currentColor" className="text-primary" strokeWidth="3" strokeLinecap="round" />
        <rect x="212" y="92" width="32" height="30" rx="12" className="fill-primary" />
        <circle cx="228" cy="84" r="12" fill="#E7C9A2" />
        <path d="M217 78 Q228 66 239 78 Q239 72 228 70 Q217 72 217 78 Z" className="fill-accent" />
        <circle cx="224" cy="85" r="1.4" fill="#3A2A18" />
        <circle cx="232" cy="85" r="1.4" fill="#3A2A18" />
        <path d="M222 90 Q228 94 234 90" stroke="#3A2A18" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </motion.g>
    </svg>
  );
}

export default FarmerCartIllustration;
