import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, Clock, Upload, MapPin } from 'lucide-react';
import { doctorAPI, appointmentAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import './BookAppointment.css';

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    doctorAPI.getById(doctorId).then(res => setDoctor(res.data));
  }, [doctorId]);

  useEffect(() => {
    if (!date) return;
    setSlotsLoading(true);
    setSelectedSlot('');
    doctorAPI.getSlots(doctorId, date)
      .then(res => setSlots(res.data.slots || []))
      .finally(() => setSlotsLoading(false));
  }, [date, doctorId]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!selectedSlot) return toast.error('Please select a time slot');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('doctorId', doctorId);
      formData.append('date', date);
      formData.append('time', selectedSlot);
      formData.append('reason', reason);
      if (file) formData.append('document', file);
      await appointmentAPI.create(formData);
      toast.success('Appointment booked successfully! 🎉');
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  if (!doctor) return <DashboardLayout><div className="cs-loading"><div className="cs-spinner" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Book Appointment</h1>
        <p className="page-subtitle">Schedule your visit with Dr. {doctor.userId?.name}</p>
      </div>

      <div className="book-layout">
        {/* Doctor Summary */}
        <div className="book-sidebar">
          <div className="cs-card doc-summary">
            <div className="cs-avatar cs-avatar-xl" style={{margin: '0 auto 16px'}}>
              {doctor.userId?.profilePhoto
                ? <img src={`http://localhost:8000/uploads/${doctor.userId.profilePhoto}`} alt="" />
                : doctor.userId?.name?.[0]}
            </div>
            <h3>Dr. {doctor.userId?.name}</h3>
            <p className="doc-spec-text">{doctor.specialization}</p>
            <p className="doc-qual-text">{doctor.qualification}</p>
            <div className="doc-summary-meta">
              <div className="meta-row"><Clock size={14} /> {doctor.experience} years experience</div>
              {doctor.address && <div className="meta-row"><MapPin size={14} /> {doctor.address}</div>}
              <div className="meta-row fee-row"><strong>₹{doctor.fees}</strong> consultation fee</div>
            </div>
            {doctor.availability?.days?.length > 0 && (
              <div className="avail-days">
                <p className="avail-label">Available Days</p>
                <div className="days-wrap">
                  {doctor.availability.days.map(d => <span key={d} className="day-chip">{d.slice(0,3)}</span>)}
                </div>
                <p className="avail-time">{doctor.availability.startTime} – {doctor.availability.endTime}</p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <div className="cs-card book-form-card">
          <form onSubmit={handleSubmit}>
            <div className="cs-form-group">
              <label className="cs-label"><Calendar size={14} /> Appointment Date</label>
              <input className="cs-input" type="date" min={minDate}
                value={date} onChange={e => setDate(e.target.value)} required />
            </div>

            {date && (
              <div className="cs-form-group">
                <label className="cs-label"><Clock size={14} /> Select Time Slot</label>
                {slotsLoading ? (
                  <div style={{padding: '20px', textAlign: 'center', color: 'var(--gray-500)'}}>Loading slots...</div>
                ) : slots.length === 0 ? (
                  <div className="no-slots">No slots available for this date</div>
                ) : (
                  <div className="slots-grid">
                    {slots.map(slot => (
                      <button key={slot.time} type="button"
                        className={`slot-btn ${!slot.available ? 'booked' : ''} ${selectedSlot === slot.time ? 'selected' : ''}`}
                        onClick={() => slot.available && setSelectedSlot(slot.time)}
                        disabled={!slot.available}>
                        {slot.time}
                        {!slot.available && <span className="slot-booked-label">Booked</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="cs-form-group">
              <label className="cs-label">Reason for Visit</label>
              <textarea className="cs-input cs-textarea" placeholder="Describe your symptoms or reason for visit..."
                value={reason} onChange={e => setReason(e.target.value)} />
            </div>

            <div className="cs-form-group">
              <label className="cs-label"><Upload size={14} /> Upload Medical Document (Optional)</label>
              <div className="file-upload-area" onClick={() => document.getElementById('doc-upload').click()}>
                <Upload size={24} />
                <p>{file ? file.name : 'Click to upload or drag & drop'}</p>
                <small>PDF, JPG, PNG up to 10MB</small>
                <input id="doc-upload" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  style={{display:'none'}} onChange={e => setFile(e.target.files[0])} />
              </div>
            </div>

            {selectedSlot && (
              <div className="booking-summary">
                <h4>Appointment Summary</h4>
                <div className="summary-row"><span>Doctor</span><span>Dr. {doctor.userId?.name}</span></div>
                <div className="summary-row"><span>Date</span><span>{date}</span></div>
                <div className="summary-row"><span>Time</span><span>{selectedSlot}</span></div>
                <div className="summary-row"><span>Fee</span><span>₹{doctor.fees}</span></div>
              </div>
            )}

            <div style={{display:'flex', gap: 12, marginTop: 8}}>
              <button type="button" className="btn-cs btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn-cs btn-primary" style={{flex:1}} disabled={loading || !selectedSlot}>
                {loading ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
