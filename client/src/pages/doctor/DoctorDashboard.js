import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { appointmentAPI, notificationAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import '../patient/PatientDashboard.css';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([appointmentAPI.getDoctorAppts(), notificationAPI.getAll()])
      .then(([a, n]) => { setAppointments(a.data); setNotifications(n.data.slice(0,5)); })
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const stats = {
    today: appointments.filter(a => a.date === today).length,
    pending: appointments.filter(a => a.status === 'pending').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    patients: [...new Set(appointments.map(a => a.patientId?._id))].length,
  };

  const upcoming = appointments.filter(a => ['pending','approved'].includes(a.status)).slice(0,5);

  if (loading) return <DashboardLayout><div className="cs-loading"><div className="cs-spinner"/></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Doctor Dashboard</h1>
        <p className="page-subtitle">Manage your appointments and patients</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon blue"><Calendar size={22}/></div><div><div className="stat-num">{stats.today}</div><div className="stat-label">Today's Appointments</div></div></div>
        <div className="stat-card"><div className="stat-icon orange"><Clock size={22}/></div><div><div className="stat-num">{stats.pending}</div><div className="stat-label">Pending</div></div></div>
        <div className="stat-card"><div className="stat-icon green"><CheckCircle size={22}/></div><div><div className="stat-num">{stats.completed}</div><div className="stat-label">Completed</div></div></div>
        <div className="stat-card"><div className="stat-icon teal"><Users size={22}/></div><div><div className="stat-num">{stats.patients}</div><div className="stat-label">Total Patients</div></div></div>
      </div>

      <div className="dash-grid">
        <div className="cs-card">
          <div className="card-header-row">
            <h3 className="card-title">Upcoming Appointments</h3>
            <Link to="/doctor/appointments" className="view-all">View all <ArrowRight size={14}/></Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="empty-state"><Calendar size={40}/><h3>No upcoming appointments</h3></div>
          ) : (
            <div className="appt-list">
              {upcoming.map(a => (
                <div key={a._id} className="appt-item">
                  <div className="cs-avatar">{a.patientId?.name?.[0]}</div>
                  <div className="appt-info">
                    <strong>{a.patientId?.name}</strong>
                    <span className="appt-time"><Calendar size={12}/> {a.date} · {a.time}</span>
                  </div>
                  <span className={`badge-cs badge-${a.status}`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cs-card">
          <div className="card-header-row">
            <h3 className="card-title">Recent Notifications</h3>
            <Link to="/doctor/notifications" className="view-all">View all <ArrowRight size={14}/></Link>
          </div>
          {notifications.length === 0 ? (
            <div className="empty-state"><h3>No notifications</h3></div>
          ) : (
            <div className="notif-list">
              {notifications.map(n => (
                <div key={n._id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
                  <div className="notif-dot-wrap">{!n.isRead && <div className="notif-dot"/>}</div>
                  <div className="notif-content"><p>{n.message}</p><small>{new Date(n.createdAt).toLocaleDateString()}</small></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
