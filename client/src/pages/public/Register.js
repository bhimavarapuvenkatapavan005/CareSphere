import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await authAPI.register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      login(data.token, data.user);
      toast.success('Account created! Welcome to CareSphere 🎉');
      navigate('/patient/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand"><Stethoscope size={32} /> CareSphere</div>
          <h2>Your Health. Your Care. Your Choice.</h2>
          <p>Join thousands of patients who trust CareSphere for their complete healthcare management.</p>
          <div className="auth-features">
            {['Free to Register','No Hidden Fees','Instant Appointment Booking','24/7 Access to Records'].map(f => (
              <div key={f} className="auth-feature-item">✓ {f}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Create your account</h2>
            <p>Start your healthcare journey today</p>
          </div>
          <form onSubmit={handleSubmit}>
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
              { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
              { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 555 0100' },
            ].map(f => (
              <div className="cs-form-group" key={f.key}>
                <label className="cs-label">{f.label}</label>
                <input className="cs-input" type={f.type} placeholder={f.placeholder}
                  value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} required />
              </div>
            ))}
            <div className="cs-form-group">
              <label className="cs-label">Password</label>
              <div className="pass-wrap">
                <input className="cs-input" type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="cs-form-group">
              <label className="cs-label">Confirm Password</label>
              <input className="cs-input" type="password" placeholder="Repeat password"
                value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} required />
            </div>
            <button className="btn-cs btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}
