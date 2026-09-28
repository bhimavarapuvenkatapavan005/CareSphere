const mongoose = require('mongoose');
require('dotenv').config();

const User   = require('./models/User');
const Doctor = require('./models/Doctor');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // ── 1. Admin ──────────────────────────────────────────────
    let admin = await User.findOne({ email: 'admin@caresphere.com' });
    if (!admin) {
      admin = await User.create({
        name: 'CareSphere Admin',
        email: 'admin@caresphere.com',
        password: 'admin123',
        phone: '+91-00000-00000',
        role: 'admin',
      });
      console.log('✅ Admin account created');
    } else {
      console.log('ℹ️  Admin already exists');
    }

    // ── 2. Indian Doctor Profiles ─────────────────────────────
    const sampleDoctors = [
      {
        name: 'Dr. Arjun Sharma',
        email: 'arjun.sharma@caresphere.com',
        phone: '+91-98201-11001',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD, DM (Cardiology) – AIIMS Delhi',
        experience: 15,
        fees: 800,
        hospital: 'Apollo Hospitals, Delhi',
        address: 'Sarita Vihar, New Delhi',
        about: 'Senior interventional cardiologist with 15 years of experience. Specialises in angioplasty, bypass surgery consultations, and heart failure management.',
        languages: ['English', 'Hindi'],
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '09:00', endTime: '17:00',
      },
      {
        name: 'Dr. Meera Iyer',
        email: 'meera.iyer@caresphere.com',
        phone: '+91-98202-11002',
        specialization: 'Neurology',
        qualification: 'MBBS, MD, DM (Neurology) – NIMHANS Bangalore',
        experience: 12,
        fees: 900,
        hospital: 'Manipal Hospital, Bangalore',
        address: 'Old Airport Road, Bangalore',
        about: 'Expert neurologist specialising in epilepsy, stroke management, and movement disorders. Trained at NIMHANS.',
        languages: ['English', 'Hindi', 'Kannada', 'Tamil'],
        days: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        startTime: '10:00', endTime: '16:00',
      },
      {
        name: 'Dr. Priya Nair',
        email: 'priya.nair@caresphere.com',
        phone: '+91-98203-11003',
        specialization: 'Pediatrics',
        qualification: 'MBBS, MD (Pediatrics) – KEM Hospital Mumbai',
        experience: 9,
        fees: 600,
        hospital: 'Kokilaben Dhirubhai Ambani Hospital, Mumbai',
        address: 'Andheri West, Mumbai',
        about: 'Dedicated paediatrician with expertise in neonatal care, childhood vaccinations, and developmental disorders.',
        languages: ['English', 'Hindi', 'Marathi', 'Malayalam'],
        days: ['Tuesday', 'Thursday', 'Saturday'],
        startTime: '08:00', endTime: '14:00',
      },
      {
        name: 'Dr. Rajesh Gupta',
        email: 'rajesh.gupta@caresphere.com',
        phone: '+91-98204-11004',
        specialization: 'Orthopedics',
        qualification: 'MBBS, MS (Orthopaedics) – PGI Chandigarh',
        experience: 18,
        fees: 700,
        hospital: 'Fortis Hospital, Gurgaon',
        address: 'Sector 44, Gurgaon, Haryana',
        about: 'Senior orthopaedic surgeon specialising in joint replacement, sports injuries, and spine surgery.',
        languages: ['English', 'Hindi', 'Punjabi'],
        days: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
        startTime: '09:00', endTime: '15:00',
      },
      {
        name: 'Dr. Sunita Reddy',
        email: 'sunita.reddy@caresphere.com',
        phone: '+91-98205-11005',
        specialization: 'Gynecology',
        qualification: 'MBBS, MS (Obstetrics & Gynaecology) – Osmania Medical College',
        experience: 14,
        fees: 750,
        hospital: 'KIMS Hospital, Hyderabad',
        address: 'Secunderabad, Hyderabad',
        about: 'Experienced gynaecologist and obstetrician. Specialises in high-risk pregnancies, laparoscopic surgeries, and infertility treatments.',
        languages: ['English', 'Hindi', 'Telugu'],
        days: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        startTime: '10:00', endTime: '17:00',
      },
      {
        name: 'Dr. Vikram Malhotra',
        email: 'vikram.malhotra@caresphere.com',
        phone: '+91-98206-11006',
        specialization: 'Dermatology',
        qualification: 'MBBS, MD (Dermatology) – PGIMER Chandigarh',
        experience: 10,
        fees: 650,
        hospital: 'Max Super Speciality Hospital, Delhi',
        address: 'Patparganj, New Delhi',
        about: 'Dermatologist with expertise in acne, psoriasis, hair loss treatments, and cosmetic dermatology procedures.',
        languages: ['English', 'Hindi', 'Punjabi'],
        days: ['Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
        startTime: '11:00', endTime: '18:00',
      },
      {
        name: 'Dr. Kavitha Krishnan',
        email: 'kavitha.krishnan@caresphere.com',
        phone: '+91-98207-11007',
        specialization: 'Psychiatry',
        qualification: 'MBBS, MD (Psychiatry) – NIMHANS Bangalore',
        experience: 11,
        fees: 850,
        hospital: 'Vandrevala Foundation Hospital, Chennai',
        address: 'Anna Nagar, Chennai',
        about: 'Psychiatrist specialising in depression, anxiety disorders, OCD, and addiction medicine. Offers both therapy and medication management.',
        languages: ['English', 'Tamil', 'Kannada'],
        days: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
        startTime: '09:00', endTime: '16:00',
      },
      {
        name: 'Dr. Anil Bhatia',
        email: 'anil.bhatia@caresphere.com',
        phone: '+91-98208-11008',
        specialization: 'Ophthalmology',
        qualification: 'MBBS, MS (Ophthalmology) – AIIMS Delhi',
        experience: 16,
        fees: 700,
        hospital: 'Sankara Nethralaya, Chennai',
        address: 'Nungambakkam, Chennai',
        about: 'Ophthalmologist with expertise in cataract surgery, LASIK, glaucoma management, and retinal disorders.',
        languages: ['English', 'Hindi', 'Tamil'],
        days: ['Monday', 'Wednesday', 'Friday'],
        startTime: '08:30', endTime: '14:30',
      },
      {
        name: 'Dr. Pooja Desai',
        email: 'pooja.desai@caresphere.com',
        phone: '+91-98209-11009',
        specialization: 'General Medicine',
        qualification: 'MBBS, MD (Internal Medicine) – Grant Medical College Mumbai',
        experience: 7,
        fees: 500,
        hospital: 'Lilavati Hospital, Mumbai',
        address: 'Bandra West, Mumbai',
        about: 'General physician providing comprehensive primary care, managing diabetes, hypertension, thyroid disorders, and infectious diseases.',
        languages: ['English', 'Hindi', 'Gujarati', 'Marathi'],
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        startTime: '08:00', endTime: '13:00',
      },
      {
        name: 'Dr. Suresh Menon',
        email: 'suresh.menon@caresphere.com',
        phone: '+91-98210-11010',
        specialization: 'ENT',
        qualification: 'MBBS, MS (ENT) – Madras Medical College',
        experience: 13,
        fees: 600,
        hospital: 'Amrita Institute of Medical Sciences, Kochi',
        address: 'Ponekkara, Kochi, Kerala',
        about: 'ENT specialist with expertise in sinus surgeries, hearing loss, tonsillectomy, and head & neck oncology.',
        languages: ['English', 'Malayalam', 'Tamil', 'Hindi'],
        days: ['Tuesday', 'Thursday', 'Saturday'],
        startTime: '09:00', endTime: '15:00',
      },
      {
        name: 'Dr. Neha Agarwal',
        email: 'neha.agarwal@caresphere.com',
        phone: '+91-98211-11011',
        specialization: 'Radiology',
        qualification: 'MBBS, MD (Radiology) – SGPGI Lucknow',
        experience: 8,
        fees: 550,
        hospital: 'Medanta – The Medicity, Gurgaon',
        address: 'Sector 38, Gurgaon, Haryana',
        about: 'Radiologist specialising in MRI, CT scan interpretation, ultrasound, and interventional radiology procedures.',
        languages: ['English', 'Hindi'],
        days: ['Monday', 'Wednesday', 'Friday'],
        startTime: '10:00', endTime: '16:00',
      },
      {
        name: 'Dr. Ramesh Pillai',
        email: 'ramesh.pillai@caresphere.com',
        phone: '+91-98212-11012',
        specialization: 'Oncology',
        qualification: 'MBBS, MD, DM (Medical Oncology) – Tata Memorial Hospital Mumbai',
        experience: 20,
        fees: 1200,
        hospital: 'Tata Memorial Hospital, Mumbai',
        address: 'Parel, Mumbai',
        about: 'Senior oncologist with 20 years of experience in cancer diagnosis and treatment including chemotherapy, immunotherapy, and targeted therapy.',
        languages: ['English', 'Hindi', 'Malayalam', 'Marathi'],
        days: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
        startTime: '09:00', endTime: '15:00',
      },
    ];

    for (const d of sampleDoctors) {
      const exists = await User.findOne({ email: d.email });
      if (exists) { console.log(`ℹ️  Doctor ${d.name} already exists`); continue; }

      const user = await User.create({
        name: d.name, email: d.email, password: 'doctor123',
        phone: d.phone, role: 'doctor',
      });

      await Doctor.create({
        userId: user._id,
        specialization: d.specialization,
        qualification: d.qualification,
        experience: d.experience,
        fees: d.fees,
        hospital: d.hospital,
        address: d.address,
        about: d.about,
        languages: d.languages,
        availability: { days: d.days, startTime: d.startTime, endTime: d.endTime, slotDuration: 30 },
        approvalStatus: 'approved',
      });

      console.log(`✅ ${d.name} (${d.specialization})`);
    }

    console.log('\n─────────────────────────────────────────────────────');
    console.log('🔐 LOGIN CREDENTIALS');
    console.log('─────────────────────────────────────────────────────');
    console.log('ADMIN');
    console.log('  Email:    admin@caresphere.com');
    console.log('  Password: admin123\n');
    console.log('DOCTORS (all use password: doctor123)');
    sampleDoctors.forEach(d => console.log(`  ${d.specialization.padEnd(18)} ${d.email}`));
    console.log('\nPatients: Register via /register');
    console.log('─────────────────────────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder error:', err.message);
    process.exit(1);
  }
};

seed();
