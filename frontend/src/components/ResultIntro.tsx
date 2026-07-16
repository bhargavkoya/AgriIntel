import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

function ResultIntro({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-accent">
      <Sparkles className="size-3.5" />
      {children}
    </div>
  );
}

export default ResultIntro;
