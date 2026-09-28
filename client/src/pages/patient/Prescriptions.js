import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Eye, X } from 'lucide-react';
import { prescriptionAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import './Prescriptions.css';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    prescriptionAPI.getMy().then(r => setPrescriptions(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">My Prescriptions</h1>
        <p className="page-subtitle">Digital prescriptions from your doctors</p>
      </div>

      {loading ? <div className="cs-loading" style={{minHeight:300}}><div className="cs-spinner"/></div>
      : prescriptions.length === 0 ? (
        <div className="empty-state cs-card"><Pill size={48}/><h3>No prescriptions yet</h3><p>Prescriptions will appear here after your consultations</p></div>
      ) : (
        <div className="rx-grid">
          {prescriptions.map(p => (
            <div key={p._id} className="rx-card cs-card">
              <div className="rx-header">
                <div className="rx-icon"><Pill size={20}/></div>
                <div>
                  <h4>Dr. {p.doctorId?.userId?.name}</h4>
                  <span>{p.doctorId?.specialization}</span>
                </div>
                <span className="rx-date">{new Date(p.prescriptionDate).toLocaleDateString()}</span>
              </div>
              <div className="rx-diagnosis"><strong>Diagnosis:</strong> {p.diagnosis}</div>
              <div className="rx-medicines">
                <strong>Medicines ({p.medicines?.length || 0})</strong>
                <div className="med-chips">
                  {p.medicines?.slice(0,3).map((m,i) => <span key={i} className="med-chip">{m.name}</span>)}
                  {p.medicines?.length > 3 && <span className="med-chip more">+{p.medicines.length-3} more</span>}
                </div>
              </div>
              <button className="btn-cs btn-outline btn-sm" style={{marginTop:'auto'}} onClick={() => setSelected(p)}>
                <Eye size={14}/> View Full Prescription
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Prescription Detail Modal */}
      {selected && (
        <div className="cs-modal-overlay" onClick={() => setSelected(null)}>
          <div className="cs-modal rx-modal" onClick={e => e.stopPropagation()}>
            <div className="cs-modal-header">
              <h3 className="cs-modal-title">Prescription</h3>
              <button className="cs-modal-close" onClick={() => setSelected(null)}><X size={20}/></button>
            </div>
            <div className="rx-detail">
              <div className="rx-detail-header">
                <div>
                  <h4>Dr. {selected.doctorId?.userId?.name}</h4>
                  <p>{selected.doctorId?.specialization}</p>
                </div>
                <div className="rx-detail-date">
                  <strong>Date:</strong> {new Date(selected.prescriptionDate).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}
                </div>
              </div>
              <div className="rx-section"><strong>Diagnosis:</strong><p>{selected.diagnosis}</p></div>
              {selected.symptoms && <div className="rx-section"><strong>Symptoms:</strong><p>{selected.symptoms}</p></div>}
              <div className="rx-section">
                <strong>Medicines</strong>
                <table className="cs-table" style={{marginTop:8}}>
                  <thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr></thead>
                  <tbody>
                    {selected.medicines?.map((m,i) => (
                      <tr key={i}><td>{m.name}</td><td>{m.dosage}</td><td>{m.frequency}</td><td>{m.duration}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {selected.instructions && <div className="rx-section"><strong>Instructions:</strong><p>{selected.instructions}</p></div>}
            </div>
            <button className="btn-cs btn-primary btn-full" style={{marginTop:16}} onClick={() => window.print()}>
              🖨️ Print / Download
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
