import { useState } from 'react';
import toast from 'react-hot-toast';
import { X, Plus, Trash2 } from 'lucide-react';
import './CreatePrescription.css';
import { prescriptionAPI } from '../../services/api';

export default function CreatePrescription({ appointment, onClose }) {
  const [form, setForm] = useState({
    diagnosis: '', symptoms: '', instructions: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
  });
  const [saving, setSaving] = useState(false);

  const addMedicine = () => setForm(f => ({ ...f, medicines: [...f.medicines, { name:'', dosage:'', frequency:'', duration:'' }] }));
  const removeMedicine = (i) => setForm(f => ({ ...f, medicines: f.medicines.filter((_,idx) => idx !== i) }));
  const updateMedicine = (i, field, value) => setForm(f => ({
    ...f, medicines: f.medicines.map((m, idx) => idx === i ? {...m, [field]: value} : m)
  }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await prescriptionAPI.create({
        patientId: appointment.patientId._id,
        appointmentId: appointment._id,
        ...form,
      });
      toast.success('Prescription created successfully');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create prescription');
    } finally { setSaving(false); }
  };

  return (
    <div className="cs-modal-overlay" onClick={onClose}>
      <div className="cs-modal" style={{maxWidth:680}} onClick={e => e.stopPropagation()}>
        <div className="cs-modal-header">
          <h3 className="cs-modal-title">Create Prescription — {appointment.patientId?.name}</h3>
          <button className="cs-modal-close" onClick={onClose}><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="cs-form-group">
            <label className="cs-label">Diagnosis *</label>
            <input className="cs-input" placeholder="Primary diagnosis" value={form.diagnosis} onChange={e => setForm({...form,diagnosis:e.target.value})} required/>
          </div>
          <div className="cs-form-group">
            <label className="cs-label">Symptoms</label>
            <input className="cs-input" placeholder="Patient symptoms" value={form.symptoms} onChange={e => setForm({...form,symptoms:e.target.value})}/>
          </div>

          <div className="cs-form-group">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <label className="cs-label" style={{margin:0}}>Medicines</label>
              <button type="button" className="btn-cs btn-ghost btn-sm" onClick={addMedicine}><Plus size={14}/> Add</button>
            </div>
            {form.medicines.map((m, i) => (
              <div key={i} className="medicine-row">
                <input className="cs-input" placeholder="Medicine name" value={m.name} onChange={e => updateMedicine(i,'name',e.target.value)}/>
                <input className="cs-input" placeholder="Dosage" value={m.dosage} onChange={e => updateMedicine(i,'dosage',e.target.value)}/>
                <input className="cs-input" placeholder="Frequency" value={m.frequency} onChange={e => updateMedicine(i,'frequency',e.target.value)}/>
                <input className="cs-input" placeholder="Duration" value={m.duration} onChange={e => updateMedicine(i,'duration',e.target.value)}/>
                {form.medicines.length > 1 && (
                  <button type="button" className="btn-cs btn-danger btn-sm" onClick={() => removeMedicine(i)}><Trash2 size={14}/></button>
                )}
              </div>
            ))}
          </div>

          <div className="cs-form-group">
            <label className="cs-label">Instructions</label>
            <textarea className="cs-input cs-textarea" placeholder="Special instructions for the patient..." value={form.instructions} onChange={e => setForm({...form,instructions:e.target.value})}/>
          </div>

          <div style={{display:'flex',gap:12}}>
            <button type="button" className="btn-cs btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-cs btn-primary" style={{flex:1}} disabled={saving}>
              {saving ? 'Creating...' : 'Create Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
