import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Clock, Save } from 'lucide-react';
import { doctorAPI } from '../../services/api';
import { generateSlots } from '../../utils/slots';
import DashboardLayout from '../../layouts/DashboardLayout';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function DoctorAvailability() {
  const [doctor, setDoctor] = useState(null);
  const [form, setForm] = useState({ days:[], startTime:'09:00', endTime:'17:00', slotDuration:30 });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState([]);

  useEffect(() => {
    doctorAPI.getMyProfile().then(r => {
      setDoctor(r.data);
      if (r.data.availability) {
        setForm({
          days: r.data.availability.days || [],
          startTime: r.data.availability.startTime || '09:00',
          endTime: r.data.availability.endTime || '17:00',
          slotDuration: r.data.availability.slotDuration || 30,
        });
      }
    });
  }, []);

  useEffect(() => {
    if (form.startTime && form.endTime) {
      setPreview(generateSlots(form.startTime, form.endTime, Number(form.slotDuration)));
    }
  }, [form.startTime, form.endTime, form.slotDuration]);

  const toggleDay = (day) => setForm(f => ({
    ...f, days: f.days.includes(day) ? f.days.filter(d => d !== day) : [...f.days, day]
  }));

  const handleSave = async () => {
    if (form.days.length === 0) return toast.error('Select at least one day');
    setSaving(true);
    try {
      await doctorAPI.update(doctor._id, { availability: form });
      toast.success('Availability updated successfully');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  if (!doctor) return <DashboardLayout><div className="cs-loading"><div className="cs-spinner"/></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Manage Availability</h1>
        <p className="page-subtitle">Set your working days and appointment slots</p>
      </div>

      <div className="two-col" style={{alignItems:'start'}}>
        <div className="cs-card">
          <h3 className="card-section-title">Schedule Settings</h3>
          <div className="cs-form-group">
            <label className="cs-label">Available Days</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:4}}>
              {DAYS.map(d => (
                <button key={d} type="button"
                  className={`btn-cs btn-sm ${form.days.includes(d) ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => toggleDay(d)}>{d}</button>
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
            <label className="cs-label">Slot Duration</label>
            <select className="cs-input cs-select" value={form.slotDuration} onChange={e => setForm({...form,slotDuration:e.target.value})}>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
          <button className="btn-cs btn-primary btn-full" onClick={handleSave} disabled={saving}>
            <Save size={16}/> {saving ? 'Saving...' : 'Save Availability'}
          </button>
        </div>

        <div className="cs-card">
          <h3 className="card-section-title">Slot Preview ({preview.length} slots/day)</h3>
          {preview.length === 0 ? (
            <p style={{color:'var(--gray-500)',fontSize:14}}>Configure your schedule to see slots</p>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
              {preview.map(slot => (
                <div key={slot} style={{padding:'8px',background:'var(--primary-light)',color:'var(--primary)',borderRadius:8,fontSize:13,fontWeight:600,textAlign:'center'}}>
                  <Clock size={12} style={{marginRight:4}}/>{slot}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
