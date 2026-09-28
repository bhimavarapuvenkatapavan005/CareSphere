import { Link } from 'react-router-dom';
import { Stethoscope, Calendar, FileText, Pill, Bell, Shield, ArrowRight, Star, CheckCircle } from 'lucide-react';
import './Home.css';

const features = [
  { icon: <Stethoscope size={24} />, title: 'Find Doctors', desc: 'Search and filter verified specialists by name, specialization, or location.', color: 'blue' },
  { icon: <Calendar size={24} />, title: 'Easy Booking', desc: 'Book available time slots instantly with real-time availability.', color: 'teal' },
  { icon: <FileText size={24} />, title: 'Medical Records', desc: 'Securely upload and manage all your medical documents in one place.', color: 'green' },
  { icon: <Pill size={24} />, title: 'Digital Prescriptions', desc: 'Access and download your prescriptions anytime, anywhere.', color: 'purple' },
  { icon: <Bell size={24} />, title: 'Smart Notifications', desc: 'Receive timely reminders and updates about your appointments.', color: 'orange' },
  { icon: <Shield size={24} />, title: 'Secure & Private', desc: 'Your health data is encrypted and protected at all times.', color: 'red' },
];

const specializations = ['Cardiology','Dermatology','Neurology','Orthopedics','Pediatrics','Psychiatry','Gynecology','Ophthalmology'];

export default function Home() {
  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="home-nav">
        <div className="home-nav-inner">
          <Link to="/" className="home-brand">
            <Stethoscope size={22} /> CareSphere
          </Link>
          <div className="home-nav-links">
            <Link to="/doctors">Find Doctors</Link>
            <Link to="/about">About</Link>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-cs btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge"><CheckCircle size={14} /> Trusted by 10,000+ patients</div>
          <h1>Healthcare made <span className="hero-highlight">simple</span> and accessible</h1>
          <p>Find the right doctor, book appointments instantly, manage medical records and stay connected with your complete healthcare journey.</p>
          <div className="hero-actions">
            <Link to="/register" className="btn-cs btn-primary btn-lg">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/doctors" className="btn-cs btn-outline btn-lg">Find a Doctor</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><span>500+</span><small>Doctors</small></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><span>10K+</span><small>Patients</small></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><span>4.9</span><small><Star size={12} /> Rating</small></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card-float">
            <div className="float-card card1">
              <Calendar size={20} className="fc-icon" />
              <div><strong>Appointment Confirmed</strong><small>Dr. Sarah Johnson · 10:00 AM</small></div>
            </div>
            <div className="float-card card2">
              <CheckCircle size={20} className="fc-icon green" />
              <div><strong>Prescription Ready</strong><small>View your latest prescription</small></div>
            </div>
            <div className="hero-illustration">
              <div className="illus-circle">
                <Stethoscope size={80} className="illus-icon" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-header">
          <h2>Everything you need for your healthcare</h2>
          <p>A complete platform connecting patients with the best healthcare professionals</p>
        </div>
        <div className="features-grid">
          {features.map(f => (
            <div key={f.title} className={`feature-card feature-${f.color}`}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Specializations */}
      <section className="spec-section">
        <div className="section-header">
          <h2>Browse by Specialization</h2>
          <p>Find specialists across all major medical fields</p>
        </div>
        <div className="spec-grid">
          {specializations.map(s => (
            <Link key={s} to={`/doctors?specialization=${s}`} className="spec-chip">
              {s}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <h2>Ready to take control of your health?</h2>
          <p>Join thousands of patients who trust CareSphere for their healthcare needs.</p>
          <div className="cta-actions">
            <Link to="/register" className="btn-cs btn-primary btn-lg">Create Free Account</Link>
            <Link to="/login" className="btn-cs btn-outline btn-lg" style={{borderColor:'white',color:'white'}}>Sign In</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-brand"><Stethoscope size={18} /> CareSphere</div>
        <p>Your Health. Your Care. Your Choice.</p>
        <p className="footer-copy">© 2024 CareSphere. All rights reserved.</p>
      </footer>
    </div>
  );
}
