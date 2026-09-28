import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import { useEffect } from 'react';
import {
  LayoutDashboard, Users, Calendar, FileText, Pill, Bell,
  User, LogOut, Menu, X, Stethoscope, Search, ClipboardList,
  BarChart3, UserCheck, Settings, UserCog
} from 'lucide-react';
import './DashboardLayout.css';

const patientNav = [
  { path: '/patient/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { path: '/patient/find-doctors', icon: <Search size={18} />, label: 'Find Doctors' },
  { path: '/patient/appointments', icon: <Calendar size={18} />, label: 'My Appointments' },
  { path: '/patient/medical-records', icon: <FileText size={18} />, label: 'Medical Records' },
  { path: '/patient/prescriptions', icon: <Pill size={18} />, label: 'Prescriptions' },
  { path: '/patient/notifications', icon: <Bell size={18} />, label: 'Notifications' },
  { path: '/patient/profile', icon: <User size={18} />, label: 'Profile' },
  { path: '/patient/apply-doctor', icon: <UserCog size={18} />, label: 'Apply as Doctor' },
];

const doctorNav = [
  { path: '/doctor/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { path: '/doctor/appointments', icon: <Calendar size={18} />, label: 'Appointments' },
  { path: '/doctor/patients', icon: <Users size={18} />, label: 'Patients' },
  { path: '/doctor/availability', icon: <Settings size={18} />, label: 'Availability' },
  { path: '/doctor/prescriptions', icon: <Pill size={18} />, label: 'Prescriptions' },
  { path: '/doctor/notifications', icon: <Bell size={18} />, label: 'Notifications' },
  { path: '/doctor/profile', icon: <User size={18} />, label: 'Profile' },
];

const adminNav = [
  { path: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { path: '/admin/users', icon: <Users size={18} />, label: 'Users' },
  { path: '/admin/doctors', icon: <UserCheck size={18} />, label: 'Doctors' },
  { path: '/admin/appointments', icon: <Calendar size={18} />, label: 'Appointments' },
  { path: '/admin/analytics', icon: <BarChart3 size={18} />, label: 'Analytics' },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navItems = user?.role === 'admin' ? adminNav : user?.role === 'doctor' ? doctorNav : patientNav;

  useEffect(() => {
    notificationAPI.getAll().then(res => {
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    }).catch(() => {});
  }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <aside className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <Stethoscope size={22} className="brand-icon" />
          <span>CareSphere</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span className="nav-badge">{unreadCount}</span>
              )}
            </Link>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="dash-main">
        <header className="dash-header">
          <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="header-right">
            <Link to={`/${user?.role}/notifications`} className="header-notif">
              <Bell size={20} />
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </Link>
            <div className="header-user">
              <div className="cs-avatar">
                {user?.profilePhoto
                  ? <img src={`http://localhost:8000/uploads/${user.profilePhoto}`} alt="" />
                  : user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="header-user-info">
                <span className="header-name">{user?.name}</span>
                <span className="header-role">{user?.role}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="dash-content">{children}</main>
      </div>
    </div>
  );
}
