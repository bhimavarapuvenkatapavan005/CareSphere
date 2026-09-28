import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, XCircle, Clock, Search, FileText, Pill, Bell, User, ArrowRight, UserCog } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI, notificationAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import './PatientDashboard.css';

const getHour = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([appointmentAPI.getMy(), notificationAPI.getAll()])
      .then(([apptRes, notifRes]) => {
        setAppointments(apptRes.data);
        setNotifications(notifRes.data.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => a.status === 'approved').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  const upcoming = appointments.filter(a => ['pending','approved'].includes(a.status)).slice(0, 3);

  const quickActions = [
    { icon: <Search size={22} />, label: 'Find Doctor', path: '/patient/find-doctors', color: 'blue' },
    { icon: <Calendar size={22} />, label: 'My Appointments', path: '/patient/appointments', color: 'teal' },
    { icon: <FileText size={22} />, label: 'Medical Records', path: '/patient/medical-records', color: 'green' },
    { icon: <Pill size={22} />, label: 'Prescriptions', path: '/patient/prescriptions', color: 'purple' },
    { icon: <Bell size={22} />, label: 'Notifications', path: '/patient/notifications', color: 'orange' },
    { icon: <User size={22} />, label: 'My Profile', path: '/patient/profile', color: 'red' },
    { icon: <UserCog size={22} />, label: 'Apply as Doctor', path: '/patient/apply-doctor', color: 'teal' },
  ];

  if (loading) return <DashboardLayout><div className="cs-loading"><div className="cs-spinner" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">{getHour()}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here's your health overview for today</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Calendar size={22} /></div>
          <div><div className="stat-num">{stats.total}</div><div className="stat-label">Total Appointments</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teal"><Clock size={22} /></div>
          <div><div className="stat-num">{stats.upcoming}</div><div className="stat-label">Upcoming</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><CheckCircle size={22} /></div>
          <div><div className="stat-num">{stats.completed}</div><div className="stat-label">Completed</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><XCircle size={22} /></div>
          <div><div className="stat-num">{stats.cancelled}</div><div className="stat-label">Cancelled</div></div>
        </div>
      </div>

      <div className="dash-grid">
        {/* Upcoming Appointments */}
        <div className="cs-card">
          <div className="card-header-row">
            <h3 className="card-title">Upcoming Appointments</h3>
            <Link to="/patient/appointments" className="view-all">View all <ArrowRight size={14} /></Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="empty-state">
              <Calendar size={40} />
              <h3>No upcoming appointments</h3>
              <p>Book an appointment with a doctor</p>
              <Link to="/patient/find-doctors" className="btn-cs btn-primary btn-sm" style={{marginTop:12}}>Find a Doctor</Link>
            </div>
          ) : (
            <div className="appt-list">
              {upcoming.map(a => (
                <div key={a._id} className="appt-item">
                  <div className="cs-avatar">
                    {a.doctorId?.userId?.profilePhoto
                      ? <img src={`http://localhost:8000/uploads/${a.doctorId.userId.profilePhoto}`} alt="" />
                      : a.doctorId?.userId?.name?.[0]}
                  </div>
                  <div className="appt-info">
                    <strong>Dr. {a.doctorId?.userId?.name}</strong>
                    <span>{a.doctorId?.specialization}</span>
                    <span className="appt-time"><Calendar size={12} /> {a.date} · {a.time}</span>
                  </div>
                  <span className={`badge-cs badge-${a.status}`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="cs-card">
          <div className="card-header-row">
            <h3 className="card-title">Recent Notifications</h3>
            <Link to="/patient/notifications" className="view-all">View all <ArrowRight size={14} /></Link>
          </div>
          {notifications.length === 0 ? (
            <div className="empty-state"><Bell size={40} /><h3>No notifications</h3></div>
          ) : (
            <div className="notif-list">
              {notifications.map(n => (
                <div key={n._id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
                  <div className="notif-dot-wrap">{!n.isRead && <div className="notif-dot" />}</div>
                  <div className="notif-content">
                    <p>{n.message}</p>
                    <small>{new Date(n.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="cs-card" style={{marginTop: 24}}>
        <h3 className="card-title" style={{marginBottom: 20}}>Quick Actions</h3>
        <div className="quick-actions-grid">
          {quickActions.map(a => (
            <Link key={a.path} to={a.path} className={`quick-action qa-${a.color}`}>
              <div className="qa-icon">{a.icon}</div>
              <span>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
