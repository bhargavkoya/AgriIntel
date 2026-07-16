import BrandLogo from './BrandLogo';

function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <BrandLogo />
        <p className="text-xs text-muted-foreground">© {year} AgriIntel. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default AppFooter;
