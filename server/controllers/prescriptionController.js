const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { createNotification } = require('../utils/notifications');

// POST /api/prescriptions
const createPrescription = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(403).json({ message: 'Doctor profile not found' });

    const { patientId, appointmentId, diagnosis, symptoms, medicines, instructions } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const prescription = await Prescription.create({
      patientId, doctorId: doctor._id, appointmentId,
      diagnosis, symptoms, medicines, instructions,
    });

    await createNotification(patientId,
      `Dr. ${req.user.name} has created a prescription for you`,
      'prescription_created');

    res.status(201).json(prescription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/prescriptions/my
const getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.user._id })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name profilePhoto' } })
      .populate('appointmentId', 'date time')
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/prescriptions/doctor
const getDoctorPrescriptions = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    const prescriptions = await Prescription.find({ doctorId: doctor._id })
      .populate('patientId', 'name email profilePhoto')
      .populate('appointmentId', 'date time')
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/prescriptions/:id
const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name profilePhoto' } })
      .populate('patientId', 'name email age gender bloodGroup')
      .populate('appointmentId', 'date time');
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
    res.json(prescription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createPrescription, getMyPrescriptions, getDoctorPrescriptions, getPrescriptionById };
