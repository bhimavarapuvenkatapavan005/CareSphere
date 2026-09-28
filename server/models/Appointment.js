const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  reason: String,
  document: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  cancelledBy: String,
  rescheduleRequest: {
    newDate: String,
    newTime: String,
    requestedAt: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
