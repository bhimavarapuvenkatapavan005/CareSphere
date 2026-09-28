import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { User, Edit3, Save, X } from 'lucide-react';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import './Profile.css';

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

export default function PatientProfile() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    userAPI.getProfile().then(r => { setProfile(r.data); setForm(r.data); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      const fields = ['name','phone','age','gender','bloodGroup','address','emergencyContact','allergies','medicalHistory'];
      fields.forEach(f => { if (form[f] !== undefined) fd.append(f, form[f]); });
      if (photo) fd.append('profilePhoto', photo);
      const res = await userAPI.updateProfile(fd);
      setProfile(res.data);
      updateUser(res.data);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  if (!profile) return <DashboardLayout><div className="cs-loading"><div className="cs-spinner"/></div></DashboardLayout>;

  const f = editing ? form : profile;

  return (
    <DashboardLayout>
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal and health information</p>
        </div>
        {!editing
          ? <button className="btn-cs btn-primary" onClick={() => setEditing(true)}><Edit3 size={16}/> Edit Profile</button>
          : <div style={{display:'flex',gap:8}}>
              <button className="btn-cs btn-ghost" onClick={() => { setEditing(false); setForm(profile); }}><X size={16}/> Cancel</button>
              <button className="btn-cs btn-primary" onClick={handleSave} disabled={saving}><Save size={16}/> {saving?'Saving...':'Save Changes'}</button>
            </div>
        }
      </div>

      <div className="profile-layout">
        {/* Avatar Card */}
        <div className="cs-card profile-avatar-card">
          <div className="cs-avatar cs-avatar-xl" style={{margin:'0 auto 16px'}}>
            {profile.profilePhoto
              ? <img src={`http://localhost:8000/uploads/${profile.profilePhoto}`} alt=""/>
              : profile.name?.[0]?.toUpperCase()}
          </div>
          <h3 style={{textAlign:'center',fontWeight:700}}>{profile.name}</h3>
          <p style={{textAlign:'center',color:'var(--gray-500)',fontSize:13,marginBottom:16}}>{profile.email}</p>
          <div className="profile-badges">
            {profile.bloodGroup && <span className="profile-badge blood">{profile.bloodGroup}</span>}
            {profile.gender && <span className="profile-badge gender">{profile.gender}</span>}
            {profile.age && <span className="profile-badge age">{profile.age} yrs</span>}
          </div>
          {editing && (
            <div style={{marginTop:16}}>
              <label className="cs-label">Change Photo</label>
              <input type="file" accept="image/*" className="cs-input" onChange={e => setPhoto(e.target.files[0])}/>
            </div>
          )}
        </div>

        <div className="profile-details">
          {/* Personal Info */}
          <div className="cs-card" style={{marginBottom:20}}>
            <h3 className="card-section-title">Personal Information</h3>
            <div className="profile-form-grid">
              {[
                {key:'name',label:'Full Name',type:'text'},
                {key:'email',label:'Email',type:'email',disabled:true},
                {key:'phone',label:'Phone',type:'tel'},
                {key:'age',label:'Age',type:'number'},
              ].map(field => (
                <div className="cs-form-group" key={field.key}>
                  <label className="cs-label">{field.label}</label>
                  {editing && !field.disabled
                    ? <input className="cs-input" type={field.type} value={f[field.key]||''} onChange={e => setForm({...form,[field.key]:e.target.value})}/>
                    : <div className="profile-value">{f[field.key] || '—'}</div>
                  }
                </div>
              ))}
              <div className="cs-form-group">
                <label className="cs-label">Gender</label>
                {editing
                  ? <select className="cs-input cs-select" value={f.gender||''} onChange={e => setForm({...form,gender:e.target.value})}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  : <div className="profile-value">{f.gender || '—'}</div>
                }
              </div>
              <div className="cs-form-group">
                <label className="cs-label">Blood Group</label>
                {editing
                  ? <select className="cs-input cs-select" value={f.bloodGroup||''} onChange={e => setForm({...form,bloodGroup:e.target.value})}>
                      <option value="">Select</option>
                      {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  : <div className="profile-value">{f.bloodGroup || '—'}</div>
                }
              </div>
            </div>
            <div className="cs-form-group">
              <label className="cs-label">Address</label>
              {editing
                ? <input className="cs-input" value={f.address||''} onChange={e => setForm({...form,address:e.target.value})}/>
                : <div className="profile-value">{f.address || '—'}</div>
              }
            </div>
            <div className="cs-form-group">
              <label className="cs-label">Emergency Contact</label>
              {editing
                ? <input className="cs-input" value={f.emergencyContact||''} onChange={e => setForm({...form,emergencyContact:e.target.value})}/>
                : <div className="profile-value">{f.emergencyContact || '—'}</div>
              }
            </div>
          </div>

          {/* Health Info */}
          <div className="cs-card">
            <h3 className="card-section-title">Health Information</h3>
            <div className="cs-form-group">
              <label className="cs-label">Known Allergies</label>
              {editing
                ? <textarea className="cs-input cs-textarea" value={f.allergies||''} onChange={e => setForm({...form,allergies:e.target.value})} placeholder="List any known allergies..."/>
                : <div className="profile-value">{f.allergies || '—'}</div>
              }
            </div>
            <div className="cs-form-group">
              <label className="cs-label">Medical History</label>
              {editing
                ? <textarea className="cs-input cs-textarea" value={f.medicalHistory||''} onChange={e => setForm({...form,medicalHistory:e.target.value})} placeholder="Previous conditions, surgeries, etc..."/>
                : <div className="profile-value">{f.medicalHistory || '—'}</div>
              }
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
