// Auth guard + frame for the Student Studio routes. Unauthenticated visitors
// go to the studio's own login (not the main /signin) so the experience
// stays self-contained.
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import StudioFrame from './StudioFrame';
import StudioErrorBoundary from './StudioErrorBoundary';
import StudioTabs, { isImmersive } from './StudioTabs';

export default function StudioShell() {
  const { isAuthenticated, isLoading } = useAuth();
  const { pathname } = useLocation();

  if (!isAuthenticated && !isLoading) return <Navigate to="/study/login" replace />;

  // The scroll container itself carries the class that reserves room for the
  // bar — an extra wrapper element here would break studio.css's
  // `.studio-scroll:has(> .st-player)` rule, which the lesson player relies on
  // for its full-height layout.
  return (
    <StudioFrame tabs={<StudioTabs />} withTabs={!isImmersive(pathname)}>
      <StudioErrorBoundary resetKey={pathname}>
        <Outlet />
      </StudioErrorBoundary>
    </StudioFrame>
  );
}
