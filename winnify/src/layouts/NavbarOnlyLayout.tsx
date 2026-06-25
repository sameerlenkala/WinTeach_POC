import { Outlet } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';

/** Full-width layout — Navbar only, no sidebar. Used for immersive pages like the IDE. */
export default function NavbarOnlyLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-x-hidden" style={{ background: 'var(--app-bg)' }}>
        <Outlet />
      </main>
    </div>
  );
}
