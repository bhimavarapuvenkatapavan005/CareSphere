import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Star, Globe, Building2, Calendar } from 'lucide-react';
import { doctorAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import './DoctorProfile.css';

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [tab, setTab] = useState('about');

  useEffect(() => {
    doctorAPI.getById(id).then(r => setDoctor(r.data));
    doctorAPI.getReviews(id).then(r => setReviews(r.data));
  }, [id]);

  if (!doctor) return <DashboardLayout><div className="cs-loading"><div className="cs-spinner"/></div></DashboardLayout>;

  const renderStars = (r) => [1,2,3,4,5].map(i => <span key={i} className={`star ${i <= Math.round(r) ? '' : 'empty'}`}>★</span>);

  return (
    <DashboardLayout>
      <div className="doc-profile-header cs-card">
        <div className="doc-profile-top">
          <div className="cs-avatar" style={{width:100,height:100,fontSize:36}}>
            {doctor.userId?.profilePhoto
              ? <img src={`http://localhost:8000/uploads/${doctor.userId.profilePhoto}`} alt=""/>
              : doctor.userId?.name?.[0]}
          </div>
          <div className="doc-profile-info">
            <div className="doc-name-row">
              <h1>Dr. {doctor.userId?.name}</h1>
              <span className="verified-badge">✓ Verified</span>
            </div>
            <p className="dp-spec">{doctor.specialization} · {doctor.qualification}</p>
            <div className="dp-meta-row">
              <span><Clock size={14}/> {doctor.experience} yrs experience</span>
              {doctor.address && <span><MapPin size={14}/> {doctor.address}</span>}
              {doctor.hospital && <span><Building2 size={14}/> {doctor.hospital}</span>}
              <span>₹{doctor.fees} / visit</span>
            </div>
            <div className="dp-rating-row">
              <div className="stars">{renderStars(doctor.rating)}</div>
              <span className="dp-rating-num">{doctor.rating > 0 ? doctor.rating : 'New'}</span>
              <span className="dp-review-count">({doctor.totalReviews} reviews)</span>
            </div>
          </div>
          <button className="btn-cs btn-primary btn-lg" onClick={() => navigate(`/patient/book/${doctor._id}`)}>
            <Calendar size={18}/> Book Appointment
          </button>
        </div>
      </div>

      <div className="cs-tabs" style={{marginTop:24}}>
        {['about','availability','reviews'].map(t => (
          <button key={t} className={`cs-tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'about' && (
        <div className="two-col" style={{gap:20}}>
          <div className="cs-card">
            <h3 className="card-section-title">About</h3>
            <p className="dp-about">{doctor.about || 'No description provided.'}</p>
            {doctor.languages?.length > 0 && (
              <div className="dp-languages">
                <Globe size={14}/> <strong>Languages:</strong> {doctor.languages.join(', ')}
              </div>
            )}
          </div>
          <div className="cs-card">
            <h3 className="card-section-title">Professional Details</h3>
            <div className="detail-list">
              <div className="detail-row"><span>Specialization</span><strong>{doctor.specialization}</strong></div>
              <div className="detail-row"><span>Qualification</span><strong>{doctor.qualification}</strong></div>
              <div className="detail-row"><span>Experience</span><strong>{doctor.experience} years</strong></div>
              <div className="detail-row"><span>Hospital/Clinic</span><strong>{doctor.hospital || '—'}</strong></div>
              <div className="detail-row"><span>Consultation Fee</span><strong>₹{doctor.fees}</strong></div>
            </div>
          </div>
        </div>
      )}

      {tab === 'availability' && (
        <div className="cs-card">
          <h3 className="card-section-title">Availability</h3>
          {doctor.availability?.days?.length > 0 ? (
            <>
              <div className="avail-days-row">
                {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => (
                  <div key={d} className={`avail-day-chip ${doctor.availability.days.includes(d) ? 'active' : ''}`}>{d.slice(0,3)}</div>
                ))}
              </div>
              <p className="avail-time-text">
                <Clock size={14}/> {doctor.availability.startTime} – {doctor.availability.endTime}
                &nbsp;·&nbsp; {doctor.availability.slotDuration || 30} min slots
              </p>
            </>
          ) : <p className="text-gray">Availability not configured yet.</p>}
        </div>
      )}

      {tab === 'reviews' && (
        <div className="cs-card">
          <h3 className="card-section-title">Patient Reviews ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <div className="empty-state"><Star size={40}/><h3>No reviews yet</h3></div>
          ) : (
            <div className="reviews-list">
              {reviews.map(r => (
                <div key={r._id} className="review-item">
                  <div className="review-header">
                    <div className="cs-avatar">{r.patientId?.name?.[0]}</div>
                    <div>
                      <strong>{r.patientId?.name}</strong>
                      <div className="stars">{renderStars(r.rating)}</div>
                    </div>
                    <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  {r.comment && <p className="review-comment">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
