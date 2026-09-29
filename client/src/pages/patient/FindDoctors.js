import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Star, Clock, Filter } from 'lucide-react';
import { doctorAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import './FindDoctors.css';

const specializations = ['All','Cardiology','Dermatology','Neurology','Orthopedics','Pediatrics','Psychiatry','Gynecology','Ophthalmology','General Medicine','ENT'];

export default function FindDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ specialization: '', minExp: '', maxFee: '', rating: '', sort: '' });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const spec = searchParams.get('specialization');
    if (spec) setFilters(f => ({ ...f, specialization: spec }));
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const params = { search, ...filters };
    Object.keys(params).forEach(k => !params[k] && delete params[k]);
    doctorAPI.getAll(params)
      .then(res => setDoctors(res.data))
      .finally(() => setLoading(false));
  }, [search, filters]);

  const renderStars = (rating) => (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star ${i <= Math.round(rating) ? '' : 'empty'}`}>★</span>
      ))}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Find the Right Doctor</h1>
        <p className="page-subtitle">Search from {doctors.length} verified healthcare professionals</p>
      </div>

      {/* Search */}
      <div className="find-search-bar cs-card" style={{padding: '16px 20px', marginBottom: 20}}>
        <div className="search-row">
          <div className="search-bar" style={{flex:1}}>
            <Search size={18} />
            <input className="cs-input" placeholder="Search by doctor name or specialization..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn-cs btn-ghost" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} /> Filters
          </button>
        </div>
        {showFilters && (
          <div className="filters-row">
            <select className="cs-input cs-select" value={filters.specialization}
              onChange={e => setFilters({...filters, specialization: e.target.value})}>
              {specializations.map(s => <option key={s} value={s === 'All' ? '' : s}>{s}</option>)}
            </select>
            <input className="cs-input" type="number" placeholder="Min experience (yrs)"
              value={filters.minExp} onChange={e => setFilters({...filters, minExp: e.target.value})} />
            <input className="cs-input" type="number" placeholder="Max fee (₹)"
              value={filters.maxFee} onChange={e => setFilters({...filters, maxFee: e.target.value})} />
            <select className="cs-input cs-select" value={filters.rating}
              onChange={e => setFilters({...filters, rating: e.target.value})}>
              <option value="">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
            <select className="cs-input cs-select" value={filters.sort}
              onChange={e => setFilters({...filters, sort: e.target.value})}>
              <option value="">Sort by</option>
              <option value="rating">Highest Rating</option>
              <option value="experience">Most Experienced</option>
              <option value="fee_asc">Lowest Fee</option>
              <option value="fee_desc">Highest Fee</option>
            </select>
          </div>
        )}
      </div>

      {/* Spec chips */}
      <div className="spec-chips">
        {specializations.map(s => (
          <button key={s}
            className={`spec-chip-btn ${filters.specialization === (s === 'All' ? '' : s) ? 'active' : ''}`}
            onClick={() => setFilters({...filters, specialization: s === 'All' ? '' : s})}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="cs-loading" style={{minHeight: 300}}><div className="cs-spinner" /></div>
      ) : doctors.length === 0 ? (
        <div className="empty-state cs-card"><Search size={48} /><h3>No doctors found</h3><p>Try adjusting your search or filters</p></div>
      ) : (
        <div className="doctors-grid">
          {doctors.map(doc => (
            <div key={doc._id} className="doctor-card cs-card">
              <div className="doc-card-header">
                <div className="cs-avatar cs-avatar-lg">
                  {doc.userId?.profilePhoto
                    ? <img src={`http://localhost:8000/uploads/${doc.userId.profilePhoto}`} alt="" />
                    : doc.userId?.name?.[0]}
                </div>
                <div className="doc-card-info">
                  <h3>Dr. {doc.userId?.name}</h3>
                  <span className="doc-spec">{doc.specialization}</span>
                  <span className="doc-qual">{doc.qualification}</span>
                </div>
              </div>
              <div className="doc-card-meta">
                <div className="doc-meta-item"><Clock size={14} /> {doc.experience} yrs exp</div>
                {doc.address && <div className="doc-meta-item"><MapPin size={14} /> {doc.address}</div>}
                <div className="doc-meta-item">₹{doc.fees} / visit</div>
              </div>
              <div className="doc-card-rating">
                {renderStars(doc.rating)}
                <span>{doc.rating > 0 ? doc.rating : 'New'}</span>
                <span className="review-count">({doc.totalReviews} reviews)</span>
              </div>
              {doc.hospital && <div className="doc-hospital">🏥 {doc.hospital}</div>}
              <div className="doc-card-actions">
                <button className="btn-cs btn-outline btn-sm" onClick={() => navigate(`/patient/doctor/${doc._id}`)}>
                  View Profile
                </button>
                <button className="btn-cs btn-primary btn-sm" onClick={() => navigate(`/patient/book/${doc._id}`)}>
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
