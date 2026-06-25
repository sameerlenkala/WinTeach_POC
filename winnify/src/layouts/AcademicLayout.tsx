import { Outlet, useLocation } from 'react-router-dom';
import HODSidebar from '@/components/layout/HODSidebar';
import FacultySidebar from '@/components/layout/FacultySidebar';
import PageTopbar from '@/components/layout/PageTopbar';

export default function AcademicLayout() {
  const location = useLocation();

  const isHOD     = location.pathname.includes('/academic/hod');
  const isFaculty = location.pathname.includes('/academic/faculty');

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--app-bg)' }}>
      {/* Sidebar — same fixed pattern as student DashboardLayout */}
      {isHOD     && <HODSidebar />}
      {isFaculty && <FacultySidebar />}

      {/* Content column — topbar + scrollable page */}
      <div className="flex flex-col flex-1 min-w-0 md:ml-[284px]" style={{ background: 'var(--app-bg)' }}>
        <PageTopbar />
        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--app-bg)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
