import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Calendar, CheckCircle, X, Eye, FileText, Pill } from 'lucide-react';
import { appointmentAPI, prescriptionAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import CreatePrescription from './CreatePrescription';
import './DoctorAppointments.css';

const TABS = ['all','pending','approved','completed','cancelled','rejected'];

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [patientModal, setPatientModal] = useState(null);
  const [rxModal, setRxModal] = useState(null);

  useEffect(() => {
    appointmentAPI.getDoctorAppts().then(r => setAppointments(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = tab === 'all' ? appointments : appointments.filter(a => a.status === tab);

  const updateStatus = async (id, status) => {
    try {
      await appointmentAPI.updateStatus(id, status);
      setAppointments(prev => prev.map(a => a._id === id ? {...a, status} : a));
      toast.success(`Appointment ${status}`);
    } catch { toast.error('Action failed'); }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Appointments</h1>
        <p className="page-subtitle">Manage all patient appointments</p>
      </div>

      <div className="cs-tabs">
        {TABS.map(t => (
          <button key={t} className={`cs-tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)} ({(t==='all'?appointments:appointments.filter(a=>a.status===t)).length})
          </button>
        ))}
      </div>

      {loading ? <div className="cs-loading" style={{minHeight:300}}><div className="cs-spinner"/></div>
      : filtered.length === 0 ? (
        <div className="empty-state cs-card"><Calendar size={48}/><h3>No {tab} appointments</h3></div>
      ) : (
        <div className="cs-card" style={{padding:0,overflow:'hidden'}}>
          <div className="cs-table-wrap">
            <table className="cs-table">
              <thead>
                <tr>
                  <th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a._id}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div className="cs-avatar">{a.patientId?.name?.[0]}</div>
                        <div>
                          <div style={{fontWeight:600}}>{a.patientId?.name}</div>
                          <div style={{fontSize:12,color:'var(--gray-500)'}}>{a.patientId?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td>{a.date}</td>
                    <td>{a.time}</td>
                    <td style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.reason || '—'}</td>
                    <td><span className={`badge-cs badge-${a.status}`}>{a.status}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-cs btn-ghost btn-sm" title="View Patient" onClick={() => setPatientModal(a.patientId)}>
                          <Eye size={14}/>
                        </button>
                        {a.document && (
                          <a href={`http://localhost:8000/uploads/${a.document}`} target="_blank" rel="noreferrer" className="btn-cs btn-ghost btn-sm" title="View Document">
                            <FileText size={14}/>
                          </a>
                        )}
                        {a.status === 'pending' && (
                          <>
                            <button className="btn-cs btn-success btn-sm" onClick={() => updateStatus(a._id,'approved')}>
                              <CheckCircle size={14}/> Approve
                            </button>
                            <button className="btn-cs btn-danger btn-sm" onClick={() => updateStatus(a._id,'rejected')}>
                              <X size={14}/> Reject
                            </button>
                          </>
                        )}
                        {a.status === 'approved' && (
                          <button className="btn-cs btn-primary btn-sm" onClick={() => updateStatus(a._id,'completed')}>
                            Complete
                          </button>
                        )}
                        {a.status === 'completed' && (
                          <button className="btn-cs btn-outline btn-sm" onClick={() => setRxModal(a)}>
                            <Pill size={14}/> Prescribe
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient Info Modal */}
      {patientModal && (
        <div className="cs-modal-overlay" onClick={() => setPatientModal(null)}>
          <div className="cs-modal" onClick={e => e.stopPropagation()}>
            <div className="cs-modal-header">
              <h3 className="cs-modal-title">Patient Information</h3>
              <button className="cs-modal-close" onClick={() => setPatientModal(null)}><X size={20}/></button>
            </div>
            <div className="patient-info-grid">
              {[
                ['Name', patientModal.name],['Email', patientModal.email],
                ['Phone', patientModal.phone],['Age', patientModal.age],
                ['Gender', patientModal.gender],['Blood Group', patientModal.bloodGroup],
                ['Emergency Contact', patientModal.emergencyContact],
              ].map(([k,v]) => v ? (
                <div key={k} className="patient-info-row"><span>{k}</span><strong>{v}</strong></div>
              ) : null)}
            </div>
            {patientModal.allergies && <div className="patient-health-section"><strong>Allergies:</strong><p>{patientModal.allergies}</p></div>}
            {patientModal.medicalHistory && <div className="patient-health-section"><strong>Medical History:</strong><p>{patientModal.medicalHistory}</p></div>}
          </div>
        </div>
      )}

      {/* Create Prescription Modal */}
      {rxModal && <CreatePrescription appointment={rxModal} onClose={() => setRxModal(null)}/>}
    </DashboardLayout>
  );
}
