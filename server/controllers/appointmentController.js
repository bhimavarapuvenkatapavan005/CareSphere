const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { createNotification } = require('../utils/notifications');

// POST /api/appointments
const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    // Prevent double booking
    const conflict = await Appointment.findOne({
      doctorId, date, time, status: { $in: ['pending', 'approved'] }
    });
    if (conflict) return res.status(400).json({ message: 'This slot is already booked' });

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId, date, time, reason,
      document: req.file ? req.file.filename : null,
    });

    const doctor = await Doctor.findById(doctorId).populate('userId', 'name _id');
    await createNotification(req.user._id,
      `Appointment booked with Dr. ${doctor.userId.name} on ${date} at ${time}`,
      'appointment_booked');
    await createNotification(doctor.userId._id,
      `New appointment request from ${req.user.name} on ${date} at ${time}`,
      'appointment_booked');

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/appointments/my  (patient)
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name profilePhoto' } })
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/appointments/doctor  (doctor)
const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate('patientId', 'name email phone profilePhoto age gender bloodGroup allergies medicalHistory')
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/appointments/:id/status
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name _id')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name _id' } });

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    appointment.status = status;
    await appointment.save();

    const typeMap = {
      approved: 'appointment_approved',
      rejected: 'appointment_rejected',
      cancelled: 'appointment_cancelled',
      completed: 'appointment_booked',
    };

    const msgMap = {
      approved: `Your appointment on ${appointment.date} at ${appointment.time} has been approved`,
      rejected: `Your appointment on ${appointment.date} at ${appointment.time} was rejected`,
      cancelled: `Appointment on ${appointment.date} at ${appointment.time} was cancelled`,
      completed: `Your appointment on ${appointment.date} has been marked as completed`,
    };

    await createNotification(appointment.patientId._id, msgMap[status], typeMap[status] || 'general');

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/appointments/:id/reschedule
const rescheduleAppointment = async (req, res) => {
  try {
    const { newDate, newTime } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.patientId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    // Check new slot availability
    const conflict = await Appointment.findOne({
      doctorId: appointment.doctorId, date: newDate, time: newTime,
      status: { $in: ['pending', 'approved'] }, _id: { $ne: appointment._id }
    });
    if (conflict) return res.status(400).json({ message: 'New slot is already booked' });

    appointment.rescheduleRequest = { newDate, newTime, requestedAt: new Date() };
    appointment.date = newDate;
    appointment.time = newTime;
    appointment.status = 'pending';
    await appointment.save();

    const doctor = await Doctor.findById(appointment.doctorId).populate('userId', '_id name');
    await createNotification(doctor.userId._id,
      `Patient ${req.user.name} requested reschedule to ${newDate} at ${newTime}`,
      'appointment_rescheduled');
    await createNotification(req.user._id,
      `Reschedule requested for ${newDate} at ${newTime}`,
      'appointment_rescheduled');

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/appointments/:id
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const isPatient = appointment.patientId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isPatient && !isAdmin) return res.status(403).json({ message: 'Not authorized' });

    appointment.status = 'cancelled';
    appointment.cancelledBy = req.user.role;
    await appointment.save();

    await createNotification(appointment.patientId,
      `Appointment on ${appointment.date} at ${appointment.time} was cancelled`,
      'appointment_cancelled');

    res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createAppointment, getMyAppointments, getDoctorAppointments, updateStatus, rescheduleAppointment, cancelAppointment };
