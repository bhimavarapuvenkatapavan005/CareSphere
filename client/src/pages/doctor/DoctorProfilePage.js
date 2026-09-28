import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Edit3, Save, X } from 'lucide-react';
import { doctorAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import '../patient/Profile.css';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function DoctorProfilePage() {
  const [doctor, setDoctor] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    doctorAPI.getMyProfile().then(r => { setDoctor(r.data); setForm(r.data); });
  }, []);

  const toggleDay = (day) => setForm(f => ({
    ...f,
    availability: {
      ...f.availability,
      days: f.availability?.days?.includes(day)
        ? f.availability.days.filter(d => d !== day)
        : [...(f.availability?.days || []), day]
    }
  }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await doctorAPI.update(doctor._id, {
        specialization: form.specialization, qualification: form.qualification,
        experience: form.experience, fees: form.fees,
        address: form.address, hospital: form.hospital,
        about: form.about, availability: form.availability,
      });
      setDoctor(res.data);
      setEditing(false);
      toast.success('Profile updated');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  if (!doctor) return <DashboardLayout><div className="cs-loading"><div className="cs-spinner"/></div></DashboardLayout>;

  const d = editing ? form : doctor;

  return (
    <DashboardLayout>
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div>
          <h1 className="page-title">My Doctor Profile</h1>
          <p className="page-subtitle">Manage your professional information</p>
        </div>
        {!editing
          ? <button className="btn-cs btn-primary" onClick={() => setEditing(true)}><Edit3 size={16}/> Edit Profile</button>
          : <div style={{display:'flex',gap:8}}>
              <button className="btn-cs btn-ghost" onClick={() => { setEditing(false); setForm(doctor); }}><X size={16}/> Cancel</button>
              <button className="btn-cs btn-primary" onClick={handleSave} disabled={saving}><Save size={16}/> {saving?'Saving...':'Save'}</button>
            </div>
        }
      </div>

      <div className="two-col" style={{alignItems:'start'}}>
        <div className="cs-card">
          <h3 className="card-section-title">Professional Details</h3>
          {[
            {key:'specialization',label:'Specialization'},
            {key:'qualification',label:'Qualification'},
            {key:'experience',label:'Experience (years)',type:'number'},
            {key:'fees',label:'Consultation Fee ($)',type:'number'},
            {key:'hospital',label:'Hospital / Clinic'},
            {key:'address',label:'Address'},
          ].map(field => (
            <div className="cs-form-group" key={field.key}>
              <label className="cs-label">{field.label}</label>
              {editing
                ? <input className="cs-input" type={field.type||'text'} value={d[field.key]||''} onChange={e => setForm({...form,[field.key]:e.target.value})}/>
                : <div className="profile-value">{d[field.key] || '—'}</div>
              }
            </div>
          ))}
          <div className="cs-form-group">
            <label className="cs-label">About</label>
            {editing
              ? <textarea className="cs-input cs-textarea" value={d.about||''} onChange={e => setForm({...form,about:e.target.value})}/>
              : <div className="profile-value">{d.about || '—'}</div>
            }
          </div>
        </div>

        <div className="cs-card">
          <h3 className="card-section-title">Availability</h3>
          <div className="cs-form-group">
            <label className="cs-label">Available Days</label>
            {editing ? (
              <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:4}}>
                {DAYS.map(day => (
                  <button key={day} type="button"
                    className={`btn-cs btn-sm ${d.availability?.days?.includes(day) ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => toggleDay(day)}>{day.slice(0,3)}</button>
                ))}
              </div>
            ) : (
              <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:4}}>
                {d.availability?.days?.map(day => (
                  <span key={day} style={{padding:'4px 12px',background:'var(--primary-light)',color:'var(--primary)',borderRadius:6,fontSize:13,fontWeight:600}}>{day}</span>
                ))}
              </div>
            )}
          </div>
          <div className="two-col">
            <div className="cs-form-group">
              <label className="cs-label">Start Time</label>
              {editing
                ? <input className="cs-input" type="time" value={d.availability?.startTime||''} onChange={e => setForm({...form,availability:{...form.availability,startTime:e.target.value}})}/>
                : <div className="profile-value">{d.availability?.startTime || '—'}</div>
              }
            </div>
            <div className="cs-form-group">
              <label className="cs-label">End Time</label>
              {editing
                ? <input className="cs-input" type="time" value={d.availability?.endTime||''} onChange={e => setForm({...form,availability:{...form.availability,endTime:e.target.value}})}/>
                : <div className="profile-value">{d.availability?.endTime || '—'}</div>
              }
            </div>
          </div>
          <div className="cs-form-group">
            <label className="cs-label">Status</label>
            <span className={`badge-cs badge-${doctor.approvalStatus}`}>{doctor.approvalStatus}</span>
          </div>
          <div className="cs-form-group">
            <label className="cs-label">Rating</label>
            <div className="profile-value">⭐ {doctor.rating || 0} ({doctor.totalReviews || 0} reviews)</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
