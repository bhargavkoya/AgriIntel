import { motion } from 'framer-motion';

function LeafIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="95" className="fill-primary/10" />
      <motion.g
        style={{ transformOrigin: '100px 172px' }}
        animate={{ rotate: [0, 5, 0, -2, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
      >
        <path
          d="M100 172 C50 152 34 90 60 40 C112 55 152 96 142 152 C136 164 118 170 100 172 Z"
          className="fill-primary"
        />
        <path
          d="M100 170 C95 138 88 88 63 44"
          stroke="white"
          strokeOpacity="0.45"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </motion.g>
      <circle cx="150" cy="55" r="10" className="fill-accent/70" />
    </svg>
  );
}

export default LeafIllustration;
