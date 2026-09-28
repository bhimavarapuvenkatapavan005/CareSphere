import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === 'admin') navigate('/admin/dashboard');
      else if (data.user.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand"><Stethoscope size={32} /> CareSphere</div>
          <h2>Your complete healthcare companion</h2>
          <p>Book appointments, manage records, and connect with top doctors — all in one place.</p>
          <div className="auth-features">
            {['500+ Verified Doctors','Real-time Slot Booking','Secure Medical Records','Digital Prescriptions'].map(f => (
              <div key={f} className="auth-feature-item">✓ {f}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to continue to CareSphere</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="cs-form-group">
              <label className="cs-label">Email Address</label>
              <input className="cs-input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="cs-form-group">
              <label className="cs-label">Password</label>
              <div className="pass-wrap">
                <input className="cs-input" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button className="btn-cs btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="auth-switch">Don't have an account? <Link to="/register">Create Account</Link></p>
          <div className="auth-demo">
            <p className="demo-title">Demo Credentials</p>
            <p><strong>Admin:</strong> admin@caresphere.com / admin123</p>
            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: 'pointer', fontSize: 13, color: '#0ea5e9' }}>Show Doctor Accounts (password: doctor123)</summary>
              <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.8 }}>
                {[
                  ['Cardiology',      'arjun.sharma@caresphere.com'],
                  ['Neurology',       'meera.iyer@caresphere.com'],
                  ['Pediatrics',      'priya.nair@caresphere.com'],
                  ['Orthopedics',     'rajesh.gupta@caresphere.com'],
                  ['Gynecology',      'sunita.reddy@caresphere.com'],
                  ['Dermatology',     'vikram.malhotra@caresphere.com'],
                  ['Psychiatry',      'kavitha.krishnan@caresphere.com'],
                  ['Ophthalmology',   'anil.bhatia@caresphere.com'],
                  ['General Medicine','pooja.desai@caresphere.com'],
                  ['ENT',             'suresh.menon@caresphere.com'],
                  ['Radiology',       'neha.agarwal@caresphere.com'],
                  ['Oncology',        'ramesh.pillai@caresphere.com'],
                ].map(([spec, email]) => (
                  <div key={email}><strong>{spec}:</strong> {email}</div>
                ))}
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
