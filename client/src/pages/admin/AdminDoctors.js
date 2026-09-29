import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Eye, X, UserPlus, Trash2 } from 'lucide-react';
import { adminAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';

const SPECS = ['Cardiology','Dermatology','Neurology','Orthopedics','Pediatrics',
               'Psychiatry','Gynecology','Ophthalmology','General Medicine','ENT','Radiology','Oncology'];
const DAYS  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const emptyForm = {
  name:'', email:'', password:'', phone:'',
  specialization:'General Medicine', qualification:'MBBS',
  experience:'', fees:'', hospital:'', address:'', languages:'English', about:'',
  days:[], startTime:'09:00', endTime:'17:00', slotDuration:30,
};

export default function AdminDoctors() {
  const [doctors, setDoctors]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);
  const [tab, setTab]               = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [creating, setCreating]     = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadDoctors = () => {
    setLoading(true);
    adminAPI.getDoctors().then(r => setDoctors(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { loadDoctors(); }, []);

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveDoctor(id);
      setDoctors(prev => prev.map(d => d._id === id ? { ...d, approvalStatus: 'approved' } : d));
      toast.success('Doctor approved successfully');
    } catch { toast.error('Action failed'); }
  };

  const handleReject = async (id) => {
    try {
      await adminAPI.rejectDoctor(id);
      setDoctors(prev => prev.map(d => d._id === id ? { ...d, approvalStatus: 'rejected' } : d));
      toast.success('Doctor application rejected');
    } catch { toast.error('Action failed'); }
  };

  const toggleDay = (day) => setForm(f => ({
    ...f, days: f.days.includes(day) ? f.days.filter(d => d !== day) : [...f.days, day]
  }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.phone)
      return toast.error('Name, email, password and phone are required');
    setCreating(true);
    try {
      await adminAPI.createDoctor({
        name: form.name, email: form.email, password: form.password, phone: form.phone,
        specialization: form.specialization, qualification: form.qualification,
        experience: Number(form.experience), fees: Number(form.fees),
        hospital: form.hospital, address: form.address,
        languages: form.languages.split(',').map(l => l.trim()),
        about: form.about,
        availability: {
          days: form.days, startTime: form.startTime,
          endTime: form.endTime, slotDuration: Number(form.slotDuration),
        },
      });
      toast.success(`Doctor account created! Login: ${form.email} / ${form.password}`);
      setShowCreate(false);
      setForm(emptyForm);
      loadDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create doctor account');
    } finally { setCreating(false); }
  };

  const handleDelete = async () => {
    try {
      await adminAPI.deleteUser(confirmDelete.userId?._id);
      setDoctors(prev => prev.filter(d => d._id !== confirmDelete._id));
      toast.success(`Dr. ${confirmDelete.userId?.name} deleted successfully`);
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const filtered = tab === 'all' ? doctors : doctors.filter(d => d.approvalStatus === tab);

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <div>
          <h1 className="page-title">Doctor Management</h1>
          <p className="page-subtitle">{doctors.filter(d => d.approvalStatus === 'pending').length} pending applications</p>
        </div>
        <button className="btn-cs btn-primary" onClick={() => setShowCreate(true)}>
          <UserPlus size={16} /> Create Doctor Account
        </button>
      </div>

      {/* Info banner */}
      <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'var(--radius)', padding:'12px 16px', marginBottom:20, fontSize:13, color:'#1e40af' }}>
        <strong>Two ways to add doctors:</strong> &nbsp;
        (1) Patient applies → Admin approves → Patient re-logs in → Doctor Dashboard &nbsp;|&nbsp;
        (2) Admin clicks "Create Doctor Account" → Immediately active
      </div>

      {/* Tabs */}
      <div className="cs-tabs">
        {['all','pending','approved','rejected'].map(t => (
          <button key={t} className={`cs-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}&nbsp;
            ({(t === 'all' ? doctors : doctors.filter(d => d.approvalStatus === t)).length})
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="cs-loading" style={{ minHeight:300 }}><div className="cs-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state cs-card">
          <h3>No {tab === 'all' ? '' : tab} doctors found</h3>
          <p>Doctors can apply from their patient dashboard, or you can create one directly.</p>
          <button className="btn-cs btn-primary btn-sm" style={{ marginTop:12 }} onClick={() => setShowCreate(true)}>
            <UserPlus size={14} /> Create Doctor Account
          </button>
        </div>
      ) : (
        <div className="cs-card" style={{ padding:0, overflow:'hidden' }}>
          <div className="cs-table-wrap">
            <table className="cs-table">
              <thead>
                <tr><th>Doctor</th><th>Specialization</th><th>Experience</th><th>Fee</th><th>Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div className="cs-avatar">{d.userId?.name?.[0]}</div>
                        <div>
                          <div style={{ fontWeight:600 }}>Dr. {d.userId?.name}</div>
                          <div style={{ fontSize:12, color:'var(--gray-500)' }}>{d.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{d.specialization}</td>
                    <td>{d.experience} yrs</td>
                    <td>₹{d.fees}</td>
                    <td><span className={`badge-cs badge-${d.approvalStatus}`}>{d.approvalStatus}</span></td>
                    <td style={{ fontSize:13, color:'var(--gray-500)' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn-cs btn-ghost btn-sm" onClick={() => setSelected(d)}>
                          <Eye size={14} />
                        </button>
                        {d.approvalStatus === 'pending' && (
                          <>
                            <button className="btn-cs btn-success btn-sm" onClick={() => handleApprove(d._id)}>
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button className="btn-cs btn-danger btn-sm" onClick={() => handleReject(d._id)}>
                              <XCircle size={14} /> Reject
                            </button>
                          </>
                        )}
                        {d.approvalStatus === 'rejected' && (
                          <button className="btn-cs btn-success btn-sm" onClick={() => handleApprove(d._id)}>
                            <CheckCircle size={14} /> Approve
                          </button>
                        )}
                        <button className="btn-cs btn-danger btn-sm" onClick={() => setConfirmDelete(d)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Doctor Modal */}
      {selected && (
        <div className="cs-modal-overlay" onClick={() => setSelected(null)}>
          <div className="cs-modal" onClick={e => e.stopPropagation()}>
            <div className="cs-modal-header">
              <h3 className="cs-modal-title">Doctor Details</h3>
              <button className="cs-modal-close" onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            {[
              ['Name', `Dr. ${selected.userId?.name}`],
              ['Email', selected.userId?.email],
              ['Phone', selected.userId?.phone],
              ['Specialization', selected.specialization],
              ['Qualification', selected.qualification],
              ['Experience', `${selected.experience} years`],
              ['Consultation Fee', `₹${selected.fees}`],
              ['Hospital', selected.hospital],
              ['Address', selected.address],
              ['Languages', selected.languages?.join(', ')],
              ['Status', selected.approvalStatus],
            ].map(([k, v]) => v ? (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--gray-100)', fontSize:14 }}>
                <span style={{ color:'var(--gray-500)' }}>{k}</span>
                <strong style={{ textAlign:'right', maxWidth:'60%' }}>{v}</strong>
              </div>
            ) : null)}
            {selected.about && (
              <div style={{ marginTop:16, padding:14, background:'var(--bg)', borderRadius:'var(--radius)' }}>
                <strong style={{ fontSize:13, display:'block', marginBottom:6 }}>About</strong>
                <p style={{ fontSize:14, color:'var(--gray-500)', lineHeight:1.6 }}>{selected.about}</p>
              </div>
            )}
            {selected.approvalStatus === 'pending' && (
              <div style={{ display:'flex', gap:12, marginTop:20 }}>
                <button className="btn-cs btn-danger" style={{ flex:1 }} onClick={() => { handleReject(selected._id); setSelected(null); }}>Reject</button>
                <button className="btn-cs btn-success" style={{ flex:1 }} onClick={() => { handleApprove(selected._id); setSelected(null); }}>Approve</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Doctor Account Modal */}
      {showCreate && (
        <div className="cs-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="cs-modal" style={{ maxWidth:680 }} onClick={e => e.stopPropagation()}>
            <div className="cs-modal-header">
              <h3 className="cs-modal-title">Create Doctor Account</h3>
              <button className="cs-modal-close" onClick={() => setShowCreate(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <p style={{ fontSize:13, color:'#1e40af', marginBottom:16, padding:'10px 14px', background:'#eff6ff', borderRadius:'var(--radius)' }}>
                ℹ️ Creates a fully approved doctor account. The doctor can log in immediately.
              </p>

              {/* Credentials */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
                <div className="cs-form-group">
                  <label className="cs-label">Full Name *</label>
                  <input className="cs-input" placeholder="Dr. Arjun Sharma" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="cs-form-group">
                  <label className="cs-label">Email *</label>
                  <input className="cs-input" type="email" placeholder="doctor@example.com" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="cs-form-group">
                  <label className="cs-label">Password *</label>
                  <input className="cs-input" type="password" placeholder="Min 6 characters" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })} required />
                </div>
                <div className="cs-form-group">
                  <label className="cs-label">Phone *</label>
                  <input className="cs-input" type="tel" placeholder="+91 98000 00000" value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })} required />
                </div>
              </div>

              {/* Professional */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
                <div className="cs-form-group">
                  <label className="cs-label">Specialization</label>
                  <select className="cs-input cs-select" value={form.specialization}
                    onChange={e => setForm({ ...form, specialization: e.target.value })}>
                    {SPECS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="cs-form-group">
                  <label className="cs-label">Qualification</label>
                  <input className="cs-input" placeholder="MBBS, MD" value={form.qualification}
                    onChange={e => setForm({ ...form, qualification: e.target.value })} />
                </div>
                <div className="cs-form-group">
                  <label className="cs-label">Experience (years)</label>
                  <input className="cs-input" type="number" min="0" value={form.experience}
                    onChange={e => setForm({ ...form, experience: e.target.value })} />
                </div>
                <div className="cs-form-group">
                  <label className="cs-label">Consultation Fee (₹)</label>
                  <input className="cs-input" type="number" min="0" value={form.fees}
                    onChange={e => setForm({ ...form, fees: e.target.value })} />
                </div>
                <div className="cs-form-group">
                  <label className="cs-label">Hospital / Clinic</label>
                  <input className="cs-input" placeholder="Apollo Hospitals, Delhi" value={form.hospital}
                    onChange={e => setForm({ ...form, hospital: e.target.value })} />
                </div>
                <div className="cs-form-group">
                  <label className="cs-label">Address</label>
                  <input className="cs-input" placeholder="City, State" value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>

              {/* Availability */}
              <div className="cs-form-group">
                <label className="cs-label">Available Days</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:4 }}>
                  {DAYS.map(d => (
                    <button key={d} type="button"
                      className={`btn-cs btn-sm ${form.days.includes(d) ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => toggleDay(d)}>{d.slice(0, 3)}</button>
                  ))}
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0 16px' }}>
                <div className="cs-form-group">
                  <label className="cs-label">Start Time</label>
                  <input className="cs-input" type="time" value={form.startTime}
                    onChange={e => setForm({ ...form, startTime: e.target.value })} />
                </div>
                <div className="cs-form-group">
                  <label className="cs-label">End Time</label>
                  <input className="cs-input" type="time" value={form.endTime}
                    onChange={e => setForm({ ...form, endTime: e.target.value })} />
                </div>
                <div className="cs-form-group">
                  <label className="cs-label">Slot Duration</label>
                  <select className="cs-input cs-select" value={form.slotDuration}
                    onChange={e => setForm({ ...form, slotDuration: e.target.value })}>
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                  </select>
                </div>
              </div>

              <div style={{ display:'flex', gap:12, marginTop:8 }}>
                <button type="button" className="btn-cs btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn-cs btn-primary" style={{ flex:1 }} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Doctor Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="cs-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="cs-modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="cs-modal-header">
              <h3 className="cs-modal-title">Delete Doctor</h3>
              <button className="cs-modal-close" onClick={() => setConfirmDelete(null)}><X size={20} /></button>
            </div>
            <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 8 }}>
              Are you sure you want to permanently delete <strong>Dr. {confirmDelete.userId?.name}</strong>?
            </p>
            <p style={{ fontSize: 13, color: 'var(--error)', marginBottom: 20 }}>
              ⚠️ This will remove their user account and doctor profile permanently.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-cs btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn-cs btn-danger" style={{ flex: 1 }} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
