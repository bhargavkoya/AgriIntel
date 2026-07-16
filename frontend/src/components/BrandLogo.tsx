import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

function BrandLogo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2', className)}>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Leaf className="size-4" />
      </span>
      <span className="font-serif text-lg tracking-tight text-foreground">AgriIntel</span>
    </Link>
  );
}

export default BrandLogo;
