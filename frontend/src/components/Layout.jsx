import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, ClipboardCheck, Calendar,
  UserPlus, LogOut, CalendarDays, ShieldCheck,
  ClipboardList, Wallet, UserCircle, Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, isManager } = useAuth();

  const handleLogout = () => { logout(); navigate('/login'); };

  const employeeLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Attendance', path: '/attendance', icon: ClipboardCheck },
    { name: 'My Leaves', path: '/leaves', icon: Calendar },
    { name: 'Leave Balance', path: '/leave-balance', icon: Wallet },
    { name: 'Face Register', path: '/register-face', icon: UserPlus },
  ];

  const managerLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Attendance', path: '/attendance', icon: ClipboardCheck },
    { name: 'Team Attendance', path: '/team-attendance', icon: Users },
    { name: 'My Leaves', path: '/leaves', icon: Calendar },
    { name: 'Leave Approvals', path: '/leave-approvals', icon: ShieldCheck },
    { name: 'Team Leave History', path: '/team-leaves', icon: ClipboardList },
    { name: 'Leave Balance', path: '/leave-balance', icon: Wallet },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Employees', path: '/employees', icon: Users },
    { name: 'Attendance', path: '/attendance', icon: ClipboardCheck },
    { name: 'Team Attendance', path: '/team-attendance', icon: ClipboardList },
    { name: 'Leave Requests', path: '/leaves', icon: Calendar },
    { name: 'Leave Approvals', path: '/leave-approvals', icon: ShieldCheck },
    { name: 'Leave Balance', path: '/leave-balance', icon: Wallet },
    { name: 'Holidays', path: '/holidays', icon: CalendarDays },
    { name: 'Leave Policies', path: '/leave-policies', icon: Settings },
  ];

  const navLinks = isAdmin ? adminLinks : isManager ? managerLinks : employeeLinks;

  const roleBadge = { ADMIN: '#7C3AED', MANAGER: '#0284C7', EMPLOYEE: '#059669' };
  const roleColor = roleBadge[user?.role] || '#94A3B8';

  return (
    <div className="layout-container">
      <aside className="sidebar glass-card">
        <div className="sidebar-header">
          <h2>EMS Portal</h2>
          <span style={{ fontSize: '0.7rem', background: roleColor, color: '#fff', padding: '2px 8px', borderRadius: 20, fontWeight: 600, marginTop: 4, display: 'inline-block' }}>
            {user?.role || 'USER'}
          </span>
        </div>
        <nav className="sidebar-nav">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link key={link.name} to={link.path} className={`nav-link ${isActive ? 'active' : ''}`}>
                <Icon size={20} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="main-wrapper">
        <header className="top-navbar glass-card">
          <div className="navbar-content">
            <h2 className="page-title">
              {navLinks.find(l => l.path === location.pathname)?.name || 'Portal'}
            </h2>
            <div className="user-profile">
              <UserCircle size={20} style={{ color: 'var(--text-secondary)' }} />
              <span className="user-name">Welcome, {user?.username || 'User'}</span>
              <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                <LogOut size={16} /><span>Logout</span>
              </button>
            </div>
          </div>
        </header>
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  );
};

export default Layout;
