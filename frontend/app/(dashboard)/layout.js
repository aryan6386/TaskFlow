'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    setMobileMenuOpen(false); // Close menu on navigation
  }, [pathname]);

  if (loading || !user) {
    return <div className="spinner-wrap"><div className="spinner"/></div>;
  }

  return (
    <div className="app-layout">
      <div className="mobile-topbar">
        <div className="sidebar-logo-text" style={{ fontSize: 18 }}>Task<span style={{ color: 'var(--primary)' }}>Flow</span></div>
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
          ☰
        </button>
      </div>
      
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}
      
      <Sidebar className={mobileMenuOpen ? 'mobile-open' : ''} />
      
      <div className="main-area">
        {children}
      </div>
    </div>
  );
}
