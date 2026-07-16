import { motion } from 'framer-motion';

function SoilIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="95" className="fill-primary/10" />
      <path d="M20 148 L180 148 L180 172 L20 172 Z" className="fill-primary/55" />
      <path d="M20 172 L180 172 L180 194 L20 194 Z" className="fill-primary/90" />
      <motion.path
        d="M100 40 C78 62 68 92 100 114 C132 92 122 62 100 40 Z"
        className="fill-accent"
        animate={{ y: [0, -6, 0], scale: [1, 1.04, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.2, ease: 'easeInOut' }}
        style={{ transformOrigin: '100px 77px' }}
      />
      <circle cx="58" cy="128" r="6" className="fill-accent/60" />
      <circle cx="142" cy="132" r="5" className="fill-accent/60" />
      <circle cx="100" cy="126" r="4" className="fill-primary" />
    </svg>
  );
}

export default SoilIllustration;
