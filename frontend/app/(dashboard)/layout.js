'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="spinner-wrap"><div className="spinner"/></div>;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        {children}
      </div>
    </div>
  );
}
