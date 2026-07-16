import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModuleBannerProps {
  to: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  illustration: ReactNode;
  reverse?: boolean;
}

function ModuleBanner({ to, eyebrow, title, description, cta, illustration, reverse }: ModuleBannerProps) {
  const navigate = useNavigate();

  return (
    <div className="grid items-center gap-8 rounded-2xl border border-border bg-card p-6 sm:p-8 md:grid-cols-2 md:gap-12">
      <div className={cn('flex justify-center', reverse && 'md:order-2')}>
        <div className="flex size-40 items-center justify-center rounded-2xl bg-muted/60 sm:size-48">
          {illustration}
        </div>
      </div>
      <div className={cn(reverse && 'md:order-1')}>
        <p className="text-xs font-semibold tracking-wide text-accent uppercase">{eyebrow}</p>
        <h2 className="mt-2 font-heading text-2xl text-foreground">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <Button className="mt-5" size="lg" onClick={() => navigate(to)}>
          {cta}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export default ModuleBanner;
