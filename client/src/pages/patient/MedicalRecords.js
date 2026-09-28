import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Upload, Trash2, Eye, FileText, X } from 'lucide-react';
import { recordAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import './MedicalRecords.css';

const TYPES = { blood_report:'Blood Report', lab_report:'Lab Report', scan_report:'Scan Report', prescription:'Prescription', other:'Other' };
const TYPE_COLORS = { blood_report:'red', lab_report:'blue', scan_report:'teal', prescription:'purple', other:'orange' };

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'blood_report' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    recordAPI.getAll().then(r => setRecords(r.data)).finally(() => setLoading(false));
  }, []);

  const handleUpload = async e => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('type', form.type);
      fd.append('file', file);
      const res = await recordAPI.upload(fd);
      setRecords(prev => [res.data, ...prev]);
      setShowModal(false);
      setForm({ title: '', type: 'blood_report' });
      setFile(null);
      toast.success('Record uploaded successfully');
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await recordAPI.delete(id);
      setRecords(prev => prev.filter(r => r._id !== id));
      toast.success('Record deleted');
    } catch { toast.error('Delete failed'); }
  };

  const filtered = filterType === 'all' ? records : records.filter(r => r.type === filterType);

  return (
    <DashboardLayout>
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div>
          <h1 className="page-title">Medical Records</h1>
          <p className="page-subtitle">🔒 Your records are securely stored and private</p>
        </div>
        <button className="btn-cs btn-primary" onClick={() => setShowModal(true)}>
          <Upload size={16}/> Upload Record
        </button>
      </div>

      {/* Filter */}
      <div className="cs-tabs">
        <button className={`cs-tab ${filterType==='all'?'active':''}`} onClick={() => setFilterType('all')}>All ({records.length})</button>
        {Object.entries(TYPES).map(([k,v]) => (
          <button key={k} className={`cs-tab ${filterType===k?'active':''}`} onClick={() => setFilterType(k)}>
            {v} ({records.filter(r=>r.type===k).length})
          </button>
        ))}
      </div>

      {loading ? <div className="cs-loading" style={{minHeight:300}}><div className="cs-spinner"/></div>
      : filtered.length === 0 ? (
        <div className="empty-state cs-card">
          <FileText size={48}/>
          <h3>No records found</h3>
          <p>Upload your medical documents to keep them organized</p>
          <button className="btn-cs btn-primary btn-sm" style={{marginTop:12}} onClick={() => setShowModal(true)}>Upload Record</button>
        </div>
      ) : (
        <div className="records-grid">
          {filtered.map(r => (
            <div key={r._id} className={`record-card cs-card record-${TYPE_COLORS[r.type]}`}>
              <div className="record-icon"><FileText size={28}/></div>
              <div className="record-info">
                <h4>{r.title}</h4>
                <span className="record-type-badge">{TYPES[r.type]}</span>
                <p className="record-date">{new Date(r.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</p>
                {r.fileName && <p className="record-filename">{r.fileName}</p>}
              </div>
              <div className="record-actions">
                <a href={`http://localhost:8000/uploads/${r.file}`} target="_blank" rel="noreferrer" className="btn-cs btn-ghost btn-sm">
                  <Eye size={14}/> View
                </a>
                <a href={`http://localhost:8000/uploads/${r.file}`} download className="btn-cs btn-outline btn-sm">
                  ↓ Download
                </a>
                <button className="btn-cs btn-danger btn-sm" onClick={() => handleDelete(r._id)}>
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="cs-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="cs-modal" onClick={e => e.stopPropagation()}>
            <div className="cs-modal-header">
              <h3 className="cs-modal-title">Upload Medical Record</h3>
              <button className="cs-modal-close" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="cs-form-group">
                <label className="cs-label">Document Title</label>
                <input className="cs-input" placeholder="e.g. Blood Test Report - Jan 2024" value={form.title} onChange={e => setForm({...form,title:e.target.value})} required/>
              </div>
              <div className="cs-form-group">
                <label className="cs-label">Document Type</label>
                <select className="cs-input cs-select" value={form.type} onChange={e => setForm({...form,type:e.target.value})}>
                  {Object.entries(TYPES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="cs-form-group">
                <label className="cs-label">File</label>
                <div className="file-upload-area" onClick={() => document.getElementById('rec-file').click()}>
                  <Upload size={24}/>
                  <p>{file ? file.name : 'Click to select file'}</p>
                  <small>PDF, JPG, PNG, DOC up to 10MB</small>
                  <input id="rec-file" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style={{display:'none'}} onChange={e => setFile(e.target.files[0])}/>
                </div>
              </div>
              <div style={{display:'flex',gap:12}}>
                <button type="button" className="btn-cs btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-cs btn-primary" style={{flex:1}} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
