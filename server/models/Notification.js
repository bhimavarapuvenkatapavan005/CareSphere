const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['appointment_booked','appointment_approved','appointment_rejected',
           'appointment_cancelled','appointment_rescheduled','doctor_approved',
           'doctor_rejected','prescription_created','appointment_reminder','general'],
    default: 'general'
  },
  isRead: { type: Boolean, default: false },
  link: String,
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
