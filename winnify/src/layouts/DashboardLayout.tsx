import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import PageTopbar from '@/components/layout/PageTopbar';
import AskAI from '@/components/common/AskAI';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--app-bg)' }}>
      {/* Sidebar — full height, fixed left */}
      <Sidebar />

      {/* Content column — topbar + scrollable page */}
      <div className="flex flex-col flex-1 min-w-0 md:ml-[284px]" style={{ background: 'var(--app-bg)' }}>
        <PageTopbar />
        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--app-bg)' }}>
          <Outlet />
        </main>
      </div>

      <AskAI />
    </div>
  );
}
