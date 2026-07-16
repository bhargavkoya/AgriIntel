import type { MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Droplets, History, Leaf, Menu, Wheat } from 'lucide-react';
import BrandLogo from './BrandLogo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PRODUCT_LINKS = [
  { to: '/disease', label: 'Plant Health Check', icon: Leaf },
  { to: '/yield', label: 'Harvest Estimate', icon: Wheat },
  { to: '/soil', label: 'Soil Health Check', icon: Droplets },
];

const navLinkClass =
  'rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';

function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  function handleHomeClick(e: MouseEvent) {
    if (location.pathname === '/' && !location.hash) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <BrandLogo />

        <nav className="hidden items-center gap-1 sm:flex">
          <Link to="/" onClick={handleHomeClick} className={navLinkClass}>
            Home
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className={`${navLinkClass} inline-flex items-center gap-1`}>
              Products
              <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {PRODUCT_LINKS.map((link) => (
                <DropdownMenuItem key={link.to} onClick={() => navigate(link.to)}>
                  <link.icon className="size-4" />
                  {link.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/#contact-section" className={navLinkClass}>
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <Link to="/history" className={`${navLinkClass} hidden items-center gap-1.5 sm:flex`}>
            <History className="size-4" />
            My past checks
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Menu"
              className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
            >
              <Menu className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/')}>Home</DropdownMenuItem>
              <DropdownMenuSeparator />
              {PRODUCT_LINKS.map((link) => (
                <DropdownMenuItem key={link.to} onClick={() => navigate(link.to)}>
                  <link.icon className="size-4" />
                  {link.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/#contact-section')}>Contact</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/history')}>
                <History className="size-4" />
                My past checks
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
