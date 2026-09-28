const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  diagnosis: { type: String, required: true },
  symptoms: String,
  medicines: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
  }],
  instructions: String,
  prescriptionDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
