import { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { adminAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import './AdminDashboard.css';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const STATUS_COLORS = { pending:'#f59e0b', approved:'#10b981', rejected:'#ef4444', cancelled:'#6b7280', completed:'#0d9488' };
const CHART_COLORS = ['#0ea5e9','#10b981','#f59e0b','#ef4444','#7c3aed','#0d9488','#f97316','#ec4899'];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics().then(r => setAnalytics(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><div className="cs-loading"><div className="cs-spinner"/></div></DashboardLayout>;

  const monthData = analytics.apptsByMonth.map(m => ({ month: MONTH_NAMES[m._id - 1], appointments: m.count }));
  const statusData = analytics.statusDist.map(s => ({ name: s._id, value: s.count }));
  const specData = analytics.specDist.map(s => ({ name: s._id, doctors: s.count }));

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">CareSphere platform overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon blue"><Users size={22}/></div><div><div className="stat-num">{analytics.totalUsers}</div><div className="stat-label">Total Patients</div></div></div>
        <div className="stat-card"><div className="stat-icon teal"><UserCheck size={22}/></div><div><div className="stat-num">{analytics.totalDoctors}</div><div className="stat-label">Active Doctors</div></div></div>
        <div className="stat-card"><div className="stat-icon blue"><Calendar size={22}/></div><div><div className="stat-num">{analytics.totalAppointments}</div><div className="stat-label">Total Appointments</div></div></div>
        <div className="stat-card"><div className="stat-icon orange"><Clock size={22}/></div><div><div className="stat-num">{analytics.pendingDoctors}</div><div className="stat-label">Pending Applications</div></div></div>
        <div className="stat-card"><div className="stat-icon green"><CheckCircle size={22}/></div><div><div className="stat-num">{analytics.completedAppts}</div><div className="stat-label">Completed</div></div></div>
        <div className="stat-card"><div className="stat-icon red"><XCircle size={22}/></div><div><div className="stat-num">{analytics.cancelledAppts}</div><div className="stat-label">Cancelled</div></div></div>
      </div>

      <div className="charts-grid">
        <div className="cs-card">
          <h3 className="card-section-title">Appointments by Month</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthData}>
              <XAxis dataKey="month" tick={{fontSize:12}}/>
              <YAxis tick={{fontSize:12}}/>
              <Tooltip/>
              <Bar dataKey="appointments" fill="#0ea5e9" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="cs-card">
          <h3 className="card-section-title">Appointment Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name,percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.name] || CHART_COLORS[i % CHART_COLORS.length]}/>
                ))}
              </Pie>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="cs-card" style={{gridColumn:'1/-1'}}>
          <h3 className="card-section-title">Doctors by Specialization</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={specData} layout="vertical">
              <XAxis type="number" tick={{fontSize:12}}/>
              <YAxis dataKey="name" type="category" width={130} tick={{fontSize:12}}/>
              <Tooltip/>
              <Bar dataKey="doctors" radius={[0,4,4,0]}>
                {specData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
