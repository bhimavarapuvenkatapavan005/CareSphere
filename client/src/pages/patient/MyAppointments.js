import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, Clock, X, RefreshCw, Eye, Star } from 'lucide-react';
import { appointmentAPI, doctorAPI, reviewAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import './MyAppointments.css';

const TABS = ['all', 'pending', 'approved', 'completed', 'cancelled', 'rejected'];

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newSlots, setNewSlots] = useState([]);
  const [newTime, setNewTime] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    appointmentAPI.getMy().then(r => setAppointments(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = tab === 'all' ? appointments : appointments.filter(a => a.status === tab);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentAPI.cancel(id);
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a));
      toast.success('Appointment cancelled');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const loadRescheduleSlots = async (date) => {
    setNewDate(date); setNewTime('');
    if (!date || !rescheduleModal) return;
    const res = await doctorAPI.getSlots(rescheduleModal.doctorId._id, date);
    setNewSlots(res.data.slots || []);
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) return toast.error('Select date and time');
    try {
      await appointmentAPI.reschedule(rescheduleModal._id, { newDate, newTime });
      setAppointments(prev => prev.map(a => a._id === rescheduleModal._id ? { ...a, date: newDate, time: newTime, status: 'pending' } : a));
      toast.success('Reschedule requested');
      setRescheduleModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleReview = async () => {
    try {
      await reviewAPI.create({ doctorId: reviewModal.doctorId._id, appointmentId: reviewModal._id, rating, comment });
      toast.success('Review submitted!');
      setReviewModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">My Appointments</h1>
        <p className="page-subtitle">Manage all your healthcare appointments</p>
      </div>

      <div className="cs-tabs">
        {TABS.map(t => (
          <button key={t} className={`cs-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            <span className="tab-count">({(t === 'all' ? appointments : appointments.filter(a => a.status === t)).length})</span>
          </button>
        ))}
      </div>

      {loading ? <div className="cs-loading" style={{minHeight:300}}><div className="cs-spinner"/></div>
      : filtered.length === 0 ? (
        <div className="empty-state cs-card">
          <Calendar size={48} />
          <h3>No {tab === 'all' ? '' : tab} appointments</h3>
          <p>Book an appointment to get started</p>
          <button className="btn-cs btn-primary btn-sm" style={{marginTop:12}} onClick={() => navigate('/patient/find-doctors')}>Find a Doctor</button>
        </div>
      ) : (
        <div className="appts-list">
          {filtered.map(a => (
            <div key={a._id} className="appt-card cs-card">
              <div className="appt-card-left">
                <div className="cs-avatar cs-avatar-lg">
                  {a.doctorId?.userId?.profilePhoto
                    ? <img src={`http://localhost:8000/uploads/${a.doctorId.userId.profilePhoto}`} alt=""/>
                    : a.doctorId?.userId?.name?.[0]}
                </div>
                <div>
                  <h3>Dr. {a.doctorId?.userId?.name}</h3>
                  <p className="appt-spec">{a.doctorId?.specialization}</p>
                  <div className="appt-datetime">
                    <span><Calendar size={13}/> {a.date}</span>
                    <span><Clock size={13}/> {a.time}</span>
                  </div>
                  {a.reason && <p className="appt-reason">"{a.reason}"</p>}
                </div>
              </div>
              <div className="appt-card-right">
                <span className={`badge-cs badge-${a.status}`}>{a.status}</span>
                <div className="appt-actions">
                  <button className="btn-cs btn-ghost btn-sm" onClick={() => navigate(`/patient/doctor/${a.doctorId?._id}`)}>
                    <Eye size={14}/> View Doctor
                  </button>
                  {['pending','approved'].includes(a.status) && (
                    <>
                      <button className="btn-cs btn-outline btn-sm" onClick={() => { setRescheduleModal(a); setNewDate(''); setNewSlots([]); setNewTime(''); }}>
                        <RefreshCw size={14}/> Reschedule
                      </button>
                      <button className="btn-cs btn-danger btn-sm" onClick={() => handleCancel(a._id)}>
                        <X size={14}/> Cancel
                      </button>
                    </>
                  )}
                  {a.status === 'completed' && (
                    <button className="btn-cs btn-primary btn-sm" onClick={() => { setReviewModal(a); setRating(5); setComment(''); }}>
                      <Star size={14}/> Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div className="cs-modal-overlay" onClick={() => setRescheduleModal(null)}>
          <div className="cs-modal" onClick={e => e.stopPropagation()}>
            <div className="cs-modal-header">
              <h3 className="cs-modal-title">Reschedule Appointment</h3>
              <button className="cs-modal-close" onClick={() => setRescheduleModal(null)}><X size={20}/></button>
            </div>
            <div className="current-appt-info">
              <p><strong>Current:</strong> {rescheduleModal.date} at {rescheduleModal.time}</p>
            </div>
            <div className="cs-form-group">
              <label className="cs-label">New Date</label>
              <input className="cs-input" type="date" min={minDate} value={newDate} onChange={e => loadRescheduleSlots(e.target.value)}/>
            </div>
            {newSlots.length > 0 && (
              <div className="cs-form-group">
                <label className="cs-label">New Time Slot</label>
                <div className="slots-grid-sm">
                  {newSlots.map(s => (
                    <button key={s.time} type="button"
                      className={`slot-btn-sm ${!s.available ? 'booked' : ''} ${newTime === s.time ? 'selected' : ''}`}
                      onClick={() => s.available && setNewTime(s.time)} disabled={!s.available}>
                      {s.time}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{display:'flex', gap:12, marginTop:8}}>
              <button className="btn-cs btn-ghost" onClick={() => setRescheduleModal(null)}>Cancel</button>
              <button className="btn-cs btn-primary" style={{flex:1}} onClick={handleReschedule}>Confirm Reschedule</button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="cs-modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="cs-modal" onClick={e => e.stopPropagation()}>
            <div className="cs-modal-header">
              <h3 className="cs-modal-title">Rate Dr. {reviewModal.doctorId?.userId?.name}</h3>
              <button className="cs-modal-close" onClick={() => setReviewModal(null)}><X size={20}/></button>
            </div>
            <div className="cs-form-group">
              <label className="cs-label">Rating</label>
              <div className="star-picker">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" className={`star-pick ${s <= rating ? 'active' : ''}`} onClick={() => setRating(s)}>★</button>
                ))}
              </div>
            </div>
            <div className="cs-form-group">
              <label className="cs-label">Review (Optional)</label>
              <textarea className="cs-input cs-textarea" placeholder="Share your experience..." value={comment} onChange={e => setComment(e.target.value)}/>
            </div>
            <div style={{display:'flex', gap:12}}>
              <button className="btn-cs btn-ghost" onClick={() => setReviewModal(null)}>Cancel</button>
              <button className="btn-cs btn-primary" style={{flex:1}} onClick={handleReview}>Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
