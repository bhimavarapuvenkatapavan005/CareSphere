import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ToggleLeft, ToggleRight, Eye, X, UserPlus } from 'lucide-react';
import { adminAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';

const emptyForm = { name: '', email: '', password: '', phone: '', role: 'patient' };

export default function AdminUsers() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [creating, setCreating]   = useState(false);

  useEffect(() => {
    adminAPI.getUsers().then(r => setUsers(r.data)).finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id) => {
    try {
      const res = await adminAPI.toggleUser(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: res.data.isActive } : u));
      toast.success(res.data.message);
    } catch { toast.error('Action failed'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.phone)
      return toast.error('All fields are required');
    setCreating(true);
    try {
      const res = await adminAPI.createUser(form);
      toast.success(`Account created for ${form.email}`);
      setShowCreate(false);
      setForm(emptyForm);
      // add to list
      setUsers(prev => [{ ...res.data.user, isActive: true, createdAt: new Date() }, ...prev]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account');
    } finally { setCreating(false); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <div className="search-bar" style={{ width:260 }}>
            <input className="cs-input" placeholder="Search users..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ paddingLeft:14 }} />
          </div>
          <button className="btn-cs btn-primary" onClick={() => setShowCreate(true)}>
            <UserPlus size={16} /> Create Account
          </button>
        </div>
      </div>

      {loading ? <div className="cs-loading" style={{ minHeight:300 }}><div className="cs-spinner" /></div>
      : (
        <div className="cs-card" style={{ padding:0, overflow:'hidden' }}>
          <div className="cs-table-wrap">
            <table className="cs-table">
              <thead>
                <tr><th>User</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div className="cs-avatar">{u.name?.[0]}</div>
                        <div>
                          <div style={{ fontWeight:600 }}>{u.name}</div>
                          <div style={{ fontSize:12, color:'var(--gray-500)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{u.phone || '—'}</td>
                    <td><span className="badge-cs badge-approved" style={{ textTransform:'capitalize' }}>{u.role}</span></td>
                    <td><span className={`badge-cs ${u.isActive ? 'badge-approved' : 'badge-cancelled'}`}>{u.isActive ? 'Active' : 'Disabled'}</span></td>
                    <td style={{ fontSize:13, color:'var(--gray-500)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn-cs btn-ghost btn-sm" onClick={() => setSelected(u)}><Eye size={14} /></button>
                        <button className={`btn-cs btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => handleToggle(u._id)}>
                          {u.isActive ? <><ToggleLeft size={14} /> Disable</> : <><ToggleRight size={14} /> Enable</>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {selected && (
        <div className="cs-modal-overlay" onClick={() => setSelected(null)}>
          <div className="cs-modal" onClick={e => e.stopPropagation()}>
            <div className="cs-modal-header">
              <h3 className="cs-modal-title">User Details</h3>
              <button className="cs-modal-close" onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[['Name', selected.name], ['Email', selected.email], ['Phone', selected.phone],
                ['Role', selected.role], ['Age', selected.age], ['Gender', selected.gender],
                ['Blood Group', selected.bloodGroup], ['Address', selected.address],
                ['Status', selected.isActive ? 'Active' : 'Disabled'],
              ].map(([k, v]) => v ? (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--gray-100)', fontSize:14 }}>
                  <span style={{ color:'var(--gray-500)' }}>{k}</span><strong>{v}</strong>
                </div>
              ) : null)}
            </div>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {showCreate && (
        <div className="cs-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="cs-modal" style={{ maxWidth:480 }} onClick={e => e.stopPropagation()}>
            <div className="cs-modal-header">
              <h3 className="cs-modal-title">Create Account</h3>
              <button className="cs-modal-close" onClick={() => setShowCreate(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="cs-form-group">
                <label className="cs-label">Full Name *</label>
                <input className="cs-input" placeholder="John Doe" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="cs-form-group">
                <label className="cs-label">Email *</label>
                <input className="cs-input" type="email" placeholder="user@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="cs-form-group">
                <label className="cs-label">Password *</label>
                <input className="cs-input" type="password" placeholder="Min 6 characters" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="cs-form-group">
                <label className="cs-label">Phone *</label>
                <input className="cs-input" type="tel" placeholder="+91 98000 00000" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div className="cs-form-group">
                <label className="cs-label">Role</label>
                <select className="cs-input cs-select" value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="patient">Patient</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display:'flex', gap:12, marginTop:8 }}>
                <button type="button" className="btn-cs btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn-cs btn-primary" style={{ flex:1 }} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
