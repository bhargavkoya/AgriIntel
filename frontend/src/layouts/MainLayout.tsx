import { Outlet } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import AppFooter from '../components/AppFooter';
import { Toaster } from '../components/ui/sonner';

function MainLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-10">
        <Outlet />
      </main>
      <AppFooter />
      <Toaster />
    </div>
  );
}

export default MainLayout;
