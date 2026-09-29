import { useState, useEffect } from 'react';
import { Search, X, User } from 'lucide-react';
import { appointmentAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import './DoctorAppointments.css';

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    appointmentAPI.getDoctorAppts().then(res => {
      const map = new Map();
      res.data.forEach(appt => {
        const p = appt.patientId;
        if (!p) return;
        if (!map.has(p._id)) {
          map.set(p._id, { ...p, lastVisit: appt.date, totalVisits: 0 });
        }
        const entry = map.get(p._id);
        entry.totalVisits += 1;
        if (appt.date > entry.lastVisit) entry.lastVisit = appt.date;
      });
      setPatients([...map.values()]);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1 className="page-title">My Patients</h1>
          <p className="page-subtitle">{patients.length} patients have visited you</p>
        </div>
        <div className="search-bar" style={{ width: 280 }}>
          <Search size={16} />
          <input className="cs-input" placeholder="Search patients..."
            value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 14 }} />
        </div>
      </div>

      {loading ? (
        <div className="cs-loading" style={{ minHeight: 300 }}><div className="cs-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state cs-card">
          <User size={48} />
          <h3>No patients yet</h3>
          <p>Patients who book appointments with you will appear here</p>
        </div>
      ) : (
        <div className="cs-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="cs-table-wrap">
            <table className="cs-table">
              <thead>
                <tr><th>Patient</th><th>Phone</th><th>Blood Group</th><th>Gender</th><th>Total Visits</th><th>Last Visit</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                        <div className="cs-avatar">{p.name?.[0]}</div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{p.phone || '—'}</td>
                    <td>{p.bloodGroup || '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{p.gender || '—'}</td>
                    <td><span className="badge-cs badge-approved">{p.totalVisits}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>{p.lastVisit || '—'}</td>
                    <td>
                      <button className="btn-cs btn-ghost btn-sm" onClick={() => setSelected(p)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="cs-modal-overlay" onClick={() => setSelected(null)}>
          <div className="cs-modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="cs-modal-header">
              <h3 className="cs-modal-title">Patient Details</h3>
              <button className="cs-modal-close" onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap: 16, marginBottom: 20 }}>
              <div className="cs-avatar" style={{ width: 56, height: 56, fontSize: 22 }}>{selected.name?.[0]}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{selected.name}</div>
                <div style={{ color: 'var(--gray-500)', fontSize: 13 }}>{selected.email}</div>
              </div>
            </div>
            <div className="patient-info-grid">
              {[
                ['Phone',             selected.phone],
                ['Age',               selected.age ? `${selected.age} yrs` : null],
                ['Gender',            selected.gender],
                ['Blood Group',       selected.bloodGroup],
                ['Total Visits',      selected.totalVisits],
                ['Last Visit',        selected.lastVisit],
                ['Address',           selected.address],
                ['Emergency Contact', selected.emergencyContact],
              ].map(([k, v]) => v ? (
                <div key={k} className="patient-info-row">
                  <span>{k}</span><strong>{v}</strong>
                </div>
              ) : null)}
            </div>
            {selected.allergies && (
              <div className="patient-health-section">
                <strong>Allergies</strong><p>{selected.allergies}</p>
              </div>
            )}
            {selected.medicalHistory && (
              <div className="patient-health-section">
                <strong>Medical History</strong><p>{selected.medicalHistory}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
