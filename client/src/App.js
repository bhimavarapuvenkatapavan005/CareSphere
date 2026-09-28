import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, PublicRoute } from './routes/ProtectedRoute';

// Public
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Patient
import PatientDashboard from './pages/patient/PatientDashboard';
import FindDoctors from './pages/patient/FindDoctors';
import DoctorProfile from './pages/patient/DoctorProfile';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import MedicalRecords from './pages/patient/MedicalRecords';
import Prescriptions from './pages/patient/Prescriptions';
import PatientProfile from './pages/patient/PatientProfile';
import Notifications from './pages/patient/Notifications';
import ApplyDoctor from './pages/patient/ApplyDoctor';

// Doctor
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorAvailability from './pages/doctor/DoctorAvailability';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import DoctorProfilePage from './pages/doctor/DoctorProfilePage';
import DoctorNotifications from './pages/doctor/DoctorNotifications';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminAnalytics from './pages/admin/AdminAnalytics';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Patient */}
          <Route path="/patient/dashboard" element={<PrivateRoute roles={['patient']}><PatientDashboard /></PrivateRoute>} />
          <Route path="/patient/find-doctors" element={<PrivateRoute roles={['patient']}><FindDoctors /></PrivateRoute>} />
          <Route path="/patient/doctor/:id" element={<PrivateRoute roles={['patient']}><DoctorProfile /></PrivateRoute>} />
          <Route path="/patient/book/:doctorId" element={<PrivateRoute roles={['patient']}><BookAppointment /></PrivateRoute>} />
          <Route path="/patient/appointments" element={<PrivateRoute roles={['patient']}><MyAppointments /></PrivateRoute>} />
          <Route path="/patient/medical-records" element={<PrivateRoute roles={['patient']}><MedicalRecords /></PrivateRoute>} />
          <Route path="/patient/prescriptions" element={<PrivateRoute roles={['patient']}><Prescriptions /></PrivateRoute>} />
          <Route path="/patient/profile" element={<PrivateRoute roles={['patient']}><PatientProfile /></PrivateRoute>} />
          <Route path="/patient/notifications" element={<PrivateRoute roles={['patient']}><Notifications /></PrivateRoute>} />
          <Route path="/patient/apply-doctor" element={<PrivateRoute roles={['patient']}><ApplyDoctor /></PrivateRoute>} />

          {/* Doctor */}
          <Route path="/doctor/dashboard" element={<PrivateRoute roles={['doctor']}><DoctorDashboard /></PrivateRoute>} />
          <Route path="/doctor/appointments" element={<PrivateRoute roles={['doctor']}><DoctorAppointments /></PrivateRoute>} />
          <Route path="/doctor/availability" element={<PrivateRoute roles={['doctor']}><DoctorAvailability /></PrivateRoute>} />
          <Route path="/doctor/prescriptions" element={<PrivateRoute roles={['doctor']}><DoctorPrescriptions /></PrivateRoute>} />
          <Route path="/doctor/profile" element={<PrivateRoute roles={['doctor']}><DoctorProfilePage /></PrivateRoute>} />
          <Route path="/doctor/notifications" element={<PrivateRoute roles={['doctor']}><DoctorNotifications /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute>} />
          <Route path="/admin/doctors" element={<PrivateRoute roles={['admin']}><AdminDoctors /></PrivateRoute>} />
          <Route path="/admin/appointments" element={<PrivateRoute roles={['admin']}><AdminAppointments /></PrivateRoute>} />
          <Route path="/admin/analytics" element={<PrivateRoute roles={['admin']}><AdminAnalytics /></PrivateRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
