# 🩺 CareSphere – Smart Healthcare Appointment & Patient Management System

> Your Health. Your Care. Your Choice.

A complete full-stack MERN healthcare platform with role-based dashboards for Patients, Doctors, and Admins.

---

## 🚀 Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React.js, React Router, Axios, Recharts |
| Backend    | Node.js, Express.js, REST API           |
| Database   | MongoDB, Mongoose                       |
| Auth       | JWT, bcrypt                             |
| File Upload| Multer                                  |
| UI         | Custom CSS Design System + Bootstrap    |

---

## 📁 Project Structure

```
CareSphere/
├── server/                  # Express backend
│   ├── config/db.js
│   ├── controllers/         # Business logic
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── middleware/          # Auth, upload, error handler
│   ├── utils/               # Notifications, slots
│   ├── uploads/             # Uploaded files
│   ├── seed.js              # Admin seeder
│   └── index.js
│
└── client/                  # React frontend
    └── src/
        ├── pages/
        │   ├── public/      # Home, Login, Register
        │   ├── patient/     # Patient dashboard & pages
        │   ├── doctor/      # Doctor dashboard & pages
        │   └── admin/       # Admin dashboard & pages
        ├── layouts/         # DashboardLayout with sidebar
        ├── context/         # AuthContext
        ├── services/        # Axios API service
        ├── routes/          # ProtectedRoute
        └── utils/           # Slot generator
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB running locally on port 27017

---

### 1. Clone / Navigate to project

```bash
cd C:\CareSphere
```

---

### 2. Setup Backend

```bash
cd server
npm install
```

Create `.env` (already included):
```
PORT=8000
MONGO_URI=mongodb://localhost:27017/caresphere
JWT_SECRET=caresphere_jwt_secret_2024_secure
NODE_ENV=development
```

Seed the admin account:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```

Backend runs at: **http://localhost:8000**

---

### 3. Setup Frontend

Open a new terminal:

```bash
cd client
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🔐 Default Login Credentials

| Role    | Email                      | Password  |
|---------|----------------------------|-----------|
| Admin   | admin@caresphere.com       | admin123  |
| Patient | Register via /register     | your choice |

---

## 👥 User Roles & Features

### 🧑‍⚕️ Patient
- Register & login
- Browse and search doctors with filters
- View doctor profiles and availability
- Book appointments with real-time slot selection
- Upload medical documents during booking
- Reschedule or cancel appointments
- View and manage medical records
- View digital prescriptions
- Rate and review doctors after completed appointments
- Apply to become a doctor
- Notification center

### 👨‍⚕️ Doctor
- Dashboard with today's stats
- Manage appointments (approve / reject / complete)
- View patient information and uploaded documents
- Create digital prescriptions
- Manage availability (days, times, slot duration)
- Notification center

### 🛡️ Admin
- Full platform overview dashboard with charts
- Manage all users (view, enable/disable)
- Review and approve/reject doctor applications
- Monitor all appointments
- Analytics with Recharts (bar, pie, horizontal bar)

---

## 🌐 API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/users/profile
PUT    /api/users/profile

POST   /api/doctors/apply
GET    /api/doctors
GET    /api/doctors/:id
GET    /api/doctors/my-profile
PUT    /api/doctors/:id
GET    /api/doctors/:id/slots?date=YYYY-MM-DD
GET    /api/doctors/:id/reviews

POST   /api/appointments
GET    /api/appointments/my
GET    /api/appointments/doctor
PUT    /api/appointments/:id/status
PUT    /api/appointments/:id/reschedule
DELETE /api/appointments/:id

POST   /api/medical-records
GET    /api/medical-records
DELETE /api/medical-records/:id

POST   /api/prescriptions
GET    /api/prescriptions/my
GET    /api/prescriptions/doctor
GET    /api/prescriptions/:id

GET    /api/notifications
PUT    /api/notifications/read-all
DELETE /api/notifications/read
PUT    /api/notifications/:id/read

POST   /api/reviews

GET    /api/admin/users
PUT    /api/admin/users/:id/toggle
GET    /api/admin/doctors
PUT    /api/admin/doctors/:id/approve
PUT    /api/admin/doctors/:id/reject
GET    /api/admin/appointments
GET    /api/admin/analytics
```

---

## 🔒 Security

- JWT authentication on all protected routes
- bcrypt password hashing (salt rounds: 12)
- Role-based authorization middleware
- Patients cannot access doctor/admin routes
- Doctors cannot access admin routes
- Patients can only view their own records
- Doctors can only view records of patients with appointments
- File uploads validated by type and size (max 10MB)

---

## 📸 Pages

| Page | Path |
|------|------|
| Home | / |
| Login | /login |
| Register | /register |
| Patient Dashboard | /patient/dashboard |
| Find Doctors | /patient/find-doctors |
| Doctor Profile | /patient/doctor/:id |
| Book Appointment | /patient/book/:doctorId |
| My Appointments | /patient/appointments |
| Medical Records | /patient/medical-records |
| Prescriptions | /patient/prescriptions |
| Patient Profile | /patient/profile |
| Notifications | /patient/notifications |
| Apply as Doctor | /patient/apply-doctor |
| Doctor Dashboard | /doctor/dashboard |
| Doctor Appointments | /doctor/appointments |
| Doctor Availability | /doctor/availability |
| Doctor Prescriptions | /doctor/prescriptions |
| Doctor Profile | /doctor/profile |
| Admin Dashboard | /admin/dashboard |
| Admin Users | /admin/users |
| Admin Doctors | /admin/doctors |
| Admin Appointments | /admin/appointments |
| Admin Analytics | /admin/analytics |
