import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { adminAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminAPI.getAppointments().then(r => setAppointments(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = appointments
    .filter(a => tab === 'all' || a.status === tab)
    .filter(a =>
      a.patientId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctorId?.userId?.name?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Appointment Management</h1>
          <p className="page-subtitle">{appointments.length} total appointments</p>
        </div>
        <input className="cs-input" placeholder="Search patient or doctor..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ width: 280 }} />
      </div>

      <div className="cs-tabs">
        {['all', 'pending', 'approved', 'completed', 'cancelled', 'rejected'].map(t => (
          <button key={t} className={`cs-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)} ({(t === 'all' ? appointments : appointments.filter(a => a.status === t)).length})
          </button>
        ))}
      </div>

      {loading ? <div className="cs-loading" style={{ minHeight: 300 }}><div className="cs-spinner" /></div> : (
        filtered.length === 0 ? (
          <div className="empty-state cs-card"><Calendar size={48} /><h3>No appointments found</h3></div>
        ) : (
          <div className="cs-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="cs-table-wrap">
              <table className="cs-table">
                <thead>
                  <tr><th>#</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Created</th></tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => (
                    <tr key={a._id}>
                      <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{String(i + 1).padStart(3, '0')}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{a.patientId?.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{a.patientId?.email}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>Dr. {a.doctorId?.userId?.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--primary)' }}>{a.doctorId?.specialization}</div>
                      </td>
                      <td>{a.date}</td>
                      <td>{a.time}</td>
                      <td><span className={`badge-cs badge-${a.status}`}>{a.status}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </DashboardLayout>
  );
}
