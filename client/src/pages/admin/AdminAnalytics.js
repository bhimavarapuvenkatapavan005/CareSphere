import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { adminAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import './AdminDashboard.css';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const STATUS_COLORS = { pending: '#f59e0b', approved: '#10b981', rejected: '#ef4444', cancelled: '#6b7280', completed: '#0d9488' };
const CHART_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#7c3aed', '#0d9488', '#f97316', '#ec4899'];

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics().then(r => setAnalytics(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><div className="cs-loading"><div className="cs-spinner" /></div></DashboardLayout>;

  const monthData = analytics.apptsByMonth.map(m => ({ month: MONTH_NAMES[m._id - 1], appointments: m.count }));
  const statusData = analytics.statusDist.map(s => ({ name: s._id, value: s.count }));
  const specData = analytics.specDist.map(s => ({ name: s._id, doctors: s.count }));

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Platform performance and insights</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-icon blue" /><div><div className="stat-num">{analytics.totalUsers}</div><div className="stat-label">Total Patients</div></div></div>
        <div className="stat-card"><div className="stat-icon teal" /><div><div className="stat-num">{analytics.totalDoctors}</div><div className="stat-label">Active Doctors</div></div></div>
        <div className="stat-card"><div className="stat-icon green" /><div><div className="stat-num">{analytics.completedAppts}</div><div className="stat-label">Completed Appointments</div></div></div>
        <div className="stat-card"><div className="stat-icon orange" /><div><div className="stat-num">{analytics.pendingDoctors}</div><div className="stat-label">Pending Applications</div></div></div>
      </div>

      <div className="charts-grid">
        <div className="cs-card">
          <h3 className="card-section-title">Appointments by Month</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="appointments" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="cs-card">
          <h3 className="card-section-title">Appointment Status Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.name] || CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="cs-card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="card-section-title">Doctors by Specialization</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={specData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="doctors" radius={[0, 4, 4, 0]}>
                {specData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
