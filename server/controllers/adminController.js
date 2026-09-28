const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const jwt = require('jsonwebtoken');
const { createNotification } = require('../utils/notifications');

const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password || !phone)
      return res.status(400).json({ message: 'Name, email, password and phone are required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, phone, role: role || 'patient' });
    res.status(201).json({ message: 'Account created successfully', user: { _id: user._id, name, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'enabled' : 'disabled'}`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('userId', 'name email phone profilePhoto isActive')
      .sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'approved' },
      { new: true }
    ).populate('userId', 'name _id email');

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Update user role to doctor
    await User.findByIdAndUpdate(doctor.userId._id, { role: 'doctor' });

    await createNotification(
      doctor.userId._id,
      'Congratulations! Your doctor application has been approved. Please log out and log back in to access your Doctor Dashboard.',
      'doctor_approved'
    );

    res.json({ message: 'Doctor approved successfully', doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const rejectDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'rejected' },
      { new: true }
    ).populate('userId', 'name _id');

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Revert role back to patient if it was changed
    await User.findByIdAndUpdate(doctor.userId._id, { role: 'patient' });

    await createNotification(
      doctor.userId._id,
      'Your doctor application has been rejected. Please contact support for more information.',
      'doctor_rejected'
    );

    res.json({ message: 'Doctor rejected', doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name email')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalDoctors, totalAppointments] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      Doctor.countDocuments({ approvalStatus: 'approved' }),
      Appointment.countDocuments(),
    ]);

    const pendingDoctors = await Doctor.countDocuments({ approvalStatus: 'pending' });
    const completedAppts = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppts = await Appointment.countDocuments({ status: 'cancelled' });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const apptsByMonth = await Appointment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
    ]);

    const statusDist = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const specDist = await Doctor.aggregate([
      { $match: { approvalStatus: 'approved' } },
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    res.json({
      totalUsers, totalDoctors, totalAppointments,
      pendingDoctors, completedAppts, cancelledAppts,
      apptsByMonth, statusDist, specDist,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/create-doctor  — Admin directly creates a doctor account
const createDoctorAccount = async (req, res) => {
  try {
    const { name, email, password, phone, specialization, qualification,
            experience, fees, address, hospital, languages, about, availability } = req.body;

    if (!name || !email || !password || !phone)
      return res.status(400).json({ message: 'Name, email, password and phone are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    // Create user with doctor role directly
    const user = await User.create({ name, email, password, phone, role: 'doctor' });

    // Create approved doctor profile
    await Doctor.create({
      userId: user._id,
      specialization: specialization || 'General Medicine',
      qualification: qualification || 'MBBS',
      experience: experience || 0,
      fees: fees || 50,
      address, hospital,
      languages: languages ? (Array.isArray(languages) ? languages : [languages]) : ['English'],
      about,
      availability: availability || { days: [], startTime: '09:00', endTime: '17:00', slotDuration: 30 },
      approvalStatus: 'approved',
    });

    await createNotification(user._id,
      'Your doctor account has been created by the admin. You can now log in.',
      'doctor_approved'
    );

    res.status(201).json({ message: 'Doctor account created successfully', email, password: '(as entered)' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createUser, getUsers, toggleUser, getDoctors, approveDoctor, rejectDoctor,
  getAppointments, getAnalytics, createDoctorAccount,
};
