import { Outlet } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import AskAI from '@/components/common/AskAI';

export default function CourseLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <AskAI />
    </div>
  );
}
