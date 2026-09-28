const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// POST /api/medical-records
const uploadRecord = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File is required' });
    const { title, type } = req.body;
    const record = await MedicalRecord.create({
      patientId: req.user._id,
      title, type,
      file: req.file.filename,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/medical-records  (patient sees own; doctor sees patient's if appointment exists)
const getRecords = async (req, res) => {
  try {
    let patientId = req.user._id;

    if (req.user.role === 'doctor' && req.query.patientId) {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      const hasAppointment = await Appointment.findOne({
        doctorId: doctor._id,
        patientId: req.query.patientId,
        status: { $in: ['approved', 'completed'] },
      });
      if (!hasAppointment) return res.status(403).json({ message: 'No appointment with this patient' });
      patientId = req.query.patientId;
    }

    const records = await MedicalRecord.find({ patientId }).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/medical-records/:id
const deleteRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.patientId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await record.deleteOne();
    res.json({ message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { uploadRecord, getRecords, deleteRecord };
