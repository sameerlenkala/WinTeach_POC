// Auth guard + frame for the Student Studio routes. Unauthenticated visitors
// go to the studio's own login (not the main /signin) so the experience
// stays self-contained.
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import StudioFrame from './StudioFrame';

export default function StudioShell() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isAuthenticated && !isLoading) return <Navigate to="/study/login" replace />;

  return (
    <StudioFrame>
      <Outlet />
    </StudioFrame>
  );
}
