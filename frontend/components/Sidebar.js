'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const links = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/projects',  icon: '📁', label: 'Projects' },
  { href: '/tasks',     icon: '✅', label: 'My Tasks' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">⚡</div>
        <div className="sidebar-logo-text">Task<span>Flow</span></div>
      </div>
      <nav className="sidebar-nav">
        {links.map(l => (
          <Link key={l.href} href={l.href}
            className={`nav-link ${pathname === l.href || pathname.startsWith(l.href + '/') ? 'active' : ''}`}>
            <span className="nav-icon">{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={logout} id="logout-btn">
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
