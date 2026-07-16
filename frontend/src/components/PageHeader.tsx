import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function PageHeader({ title, subtitle, backTo = '/' }: { title: string; subtitle?: string; backTo?: string }) {
  return (
    <div className="mb-6">
      <Link
        to={backTo}
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>
      <h1 className="font-serif text-2xl text-foreground">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export default PageHeader;
