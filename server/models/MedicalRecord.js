const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['blood_report', 'lab_report', 'scan_report', 'prescription', 'other'],
    required: true
  },
  file: { type: String, required: true },
  fileName: String,
  fileSize: Number,
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
