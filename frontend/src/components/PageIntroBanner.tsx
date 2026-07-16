import type { ReactNode } from 'react';

function PageIntroBanner({ illustration, children }: { illustration: ReactNode; children: ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-4 rounded-xl bg-primary/5 p-4 sm:p-5">
      <div className="flex size-14 shrink-0 items-center justify-center sm:size-16">{illustration}</div>
      <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

export default PageIntroBanner;
