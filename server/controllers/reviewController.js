const Review = require('../models/Review');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { doctorId, appointmentId, rating, comment } = req.body;

    const appointment = await Appointment.findOne({
      _id: appointmentId, patientId: req.user._id, status: 'completed'
    });
    if (!appointment) return res.status(400).json({ message: 'Can only review after a completed appointment' });

    const existing = await Review.findOne({ appointmentId });
    if (existing) return res.status(400).json({ message: 'Already reviewed this appointment' });

    const review = await Review.create({
      patientId: req.user._id, doctorId, appointmentId, rating, comment
    });

    // Recalculate doctor rating
    const reviews = await Review.find({ doctorId });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await Doctor.findByIdAndUpdate(doctorId, { rating: avg.toFixed(1), totalReviews: reviews.length });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/doctors/:id/reviews
const getDoctorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ doctorId: req.params.id })
      .populate('patientId', 'name profilePhoto')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createReview, getDoctorReviews };
