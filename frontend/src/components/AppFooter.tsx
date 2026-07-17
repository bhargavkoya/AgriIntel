import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <BrandLogo />
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
          <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground">
            Privacy Policy
          </Link>
          <Link to="/terms" className="text-xs text-muted-foreground hover:text-foreground">
            Terms of Use
          </Link>
          <p className="text-xs text-muted-foreground">© {year} AgriIntel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;
