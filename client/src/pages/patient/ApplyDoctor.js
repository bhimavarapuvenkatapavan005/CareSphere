import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Stethoscope } from 'lucide-react';
import { doctorAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const SPECS = ['Cardiology','Dermatology','Neurology','Orthopedics','Pediatrics','Psychiatry','Gynecology','Ophthalmology','General Medicine','ENT','Radiology','Oncology'];

export default function ApplyDoctor() {
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    specialization:'', qualification:'', experience:'', fees:'',
    address:'', hospital:'', languages:'English', about:'',
    days:[], startTime:'09:00', endTime:'17:00', slotDuration:30,
  });

  useEffect(() => {
    doctorAPI.getMyProfile()
      .then(r => setExisting(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleDay = (day) => setForm(f => ({
    ...f, days: f.days.includes(day) ? f.days.filter(d => d !== day) : [...f.days, day]
  }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.days.length === 0) return toast.error('Select at least one available day');
    setSubmitting(true);
    try {
      await doctorAPI.apply({
        specialization: form.specialization, qualification: form.qualification,
        experience: Number(form.experience), fees: Number(form.fees),
        address: form.address, hospital: form.hospital,
        languages: form.languages.split(',').map(l => l.trim()),
        about: form.about,
        availability: { days: form.days, startTime: form.startTime, endTime: form.endTime, slotDuration: Number(form.slotDuration) },
      });
      toast.success('Application submitted! Awaiting admin approval.');
      doctorAPI.getMyProfile().then(r => setExisting(r.data)).catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  if (loading) return <DashboardLayout><div className="cs-loading"><div className="cs-spinner"/></div></DashboardLayout>;

  if (existing) return (
    <DashboardLayout>
      <div className="page-header"><h1 className="page-title">Doctor Application</h1></div>
      <div className="cs-card" style={{maxWidth:500,textAlign:'center',padding:48,margin:'0 auto'}}>
        <Stethoscope size={60} style={{color:'var(--primary)',marginBottom:16}}/>
        <h2 style={{marginBottom:8,textTransform:'capitalize'}}>Application {existing.approvalStatus}</h2>
        <p style={{color:'var(--gray-500)',marginBottom:20}}>
          {existing.approvalStatus === 'pending' && 'Your application is under review. We will notify you once approved.'}
          {existing.approvalStatus === 'approved' && 'Congratulations! Your doctor profile is now active.'}
          {existing.approvalStatus === 'rejected' && 'Your application was rejected. Please contact support for more information.'}
        </p>
        <span className={`badge-cs badge-${existing.approvalStatus}`} style={{fontSize:15,padding:'8px 24px'}}>{existing.approvalStatus}</span>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Apply as a Doctor</h1>
        <p className="page-subtitle">Fill in your professional details to join CareSphere</p>
      </div>
      <form onSubmit={handleSubmit} style={{maxWidth:800}}>
        <div className="cs-card" style={{marginBottom:20}}>
          <h3 className="card-section-title">Professional Details</h3>
          <div className="two-col">
            <div className="cs-form-group">
              <label className="cs-label">Specialization *</label>
              <select className="cs-input cs-select" value={form.specialization} onChange={e => setForm({...form,specialization:e.target.value})} required>
                <option value="">Select specialization</option>
                {SPECS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="cs-form-group">
              <label className="cs-label">Qualification *</label>
              <input className="cs-input" placeholder="e.g. MBBS, MD" value={form.qualification} onChange={e => setForm({...form,qualification:e.target.value})} required/>
            </div>
            <div className="cs-form-group">
              <label className="cs-label">Experience (years) *</label>
              <input className="cs-input" type="number" min="0" value={form.experience} onChange={e => setForm({...form,experience:e.target.value})} required/>
            </div>
            <div className="cs-form-group">
              <label className="cs-label">Consultation Fee ($) *</label>
              <input className="cs-input" type="number" min="0" value={form.fees} onChange={e => setForm({...form,fees:e.target.value})} required/>
            </div>
            <div className="cs-form-group">
              <label className="cs-label">Hospital / Clinic</label>
              <input className="cs-input" placeholder="Hospital or clinic name" value={form.hospital} onChange={e => setForm({...form,hospital:e.target.value})}/>
            </div>
            <div className="cs-form-group">
              <label className="cs-label">Address / Location</label>
              <input className="cs-input" placeholder="City, State" value={form.address} onChange={e => setForm({...form,address:e.target.value})}/>
            </div>
          </div>
          <div className="cs-form-group">
            <label className="cs-label">Languages (comma separated)</label>
            <input className="cs-input" placeholder="English, Spanish" value={form.languages} onChange={e => setForm({...form,languages:e.target.value})}/>
          </div>
          <div className="cs-form-group">
            <label className="cs-label">About You</label>
            <textarea className="cs-input cs-textarea" placeholder="Describe your expertise, experience and approach to patient care..." value={form.about} onChange={e => setForm({...form,about:e.target.value})} style={{minHeight:100}}/>
          </div>
        </div>

        <div className="cs-card" style={{marginBottom:20}}>
          <h3 className="card-section-title">Availability Schedule</h3>
          <div className="cs-form-group">
            <label className="cs-label">Available Days *</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:4}}>
              {DAYS.map(d => (
                <button key={d} type="button"
                  className={`btn-cs btn-sm ${form.days.includes(d) ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => toggleDay(d)}>{d.slice(0,3)}</button>
              ))}
            </div>
          </div>
          <div className="two-col">
            <div className="cs-form-group">
              <label className="cs-label">Start Time</label>
              <input className="cs-input" type="time" value={form.startTime} onChange={e => setForm({...form,startTime:e.target.value})}/>
            </div>
            <div className="cs-form-group">
              <label className="cs-label">End Time</label>
              <input className="cs-input" type="time" value={form.endTime} onChange={e => setForm({...form,endTime:e.target.value})}/>
            </div>
          </div>
          <div className="cs-form-group">
            <label className="cs-label">Appointment Slot Duration</label>
            <select className="cs-input cs-select" value={form.slotDuration} onChange={e => setForm({...form,slotDuration:e.target.value})}>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn-cs btn-primary btn-lg" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </DashboardLayout>
  );
}
