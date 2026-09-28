const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { generateSlots } = require('../utils/slots');
const { createNotification } = require('../utils/notifications');

// POST /api/doctors/apply
const applyDoctor = async (req, res) => {
  try {
    const existing = await Doctor.findOne({ userId: req.user._id });
    if (existing) return res.status(400).json({ message: 'Application already submitted' });

    const { specialization, qualification, experience, fees, address, hospital,
            languages, about, availability } = req.body;

    const doctor = await Doctor.create({
      userId: req.user._id,
      specialization, qualification, experience, fees,
      address, hospital,
      languages: Array.isArray(languages) ? languages : [languages],
      about, availability,
    });

    // Notify admin
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(admin._id,
        `New doctor application from ${req.user.name} (${specialization})`,
        'general', '/admin/doctors');
    }

    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/doctors
const getDoctors = async (req, res) => {
  try {
    const { search, specialization, minExp, maxFee, rating, sort } = req.query;
    const query = { approvalStatus: 'approved' };

    if (specialization) query.specialization = { $regex: specialization, $options: 'i' };
    if (minExp) query.experience = { $gte: Number(minExp) };
    if (maxFee) query.fees = { $lte: Number(maxFee) };
    if (rating) query.rating = { $gte: Number(rating) };

    let doctors = await Doctor.find(query).populate('userId', 'name email profilePhoto');

    if (search) {
      const s = search.toLowerCase();
      doctors = doctors.filter(d =>
        d.userId?.name?.toLowerCase().includes(s) ||
        d.specialization?.toLowerCase().includes(s) ||
        d.address?.toLowerCase().includes(s)
      );
    }

    if (sort === 'rating') doctors.sort((a, b) => b.rating - a.rating);
    else if (sort === 'experience') doctors.sort((a, b) => b.experience - a.experience);
    else if (sort === 'fee_asc') doctors.sort((a, b) => a.fees - b.fees);
    else if (sort === 'fee_desc') doctors.sort((a, b) => b.fees - a.fees);

    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/doctors/:id
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email profilePhoto phone');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/doctors/my-profile
const getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id }).populate('userId', 'name email profilePhoto phone');
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/doctors/:id
const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const fields = ['specialization','qualification','experience','fees','address',
                    'hospital','languages','about','availability'];
    fields.forEach(f => { if (req.body[f] !== undefined) doctor[f] = req.body[f]; });
    await doctor.save();
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/doctors/:id/slots?date=YYYY-MM-DD
const getSlots = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor || !doctor.availability?.startTime)
      return res.status(404).json({ message: 'Doctor or availability not found' });

    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Date is required' });

    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    if (!doctor.availability.days.includes(dayName))
      return res.json({ slots: [], message: 'Doctor not available on this day' });

    const allSlots = generateSlots(
      doctor.availability.startTime,
      doctor.availability.endTime,
      doctor.availability.slotDuration || 30
    );

    const booked = await Appointment.find({
      doctorId: req.params.id,
      date,
      status: { $in: ['pending', 'approved'] },
    }).select('time');

    const bookedTimes = booked.map(a => a.time);
    const slots = allSlots.map(slot => ({
      time: slot,
      available: !bookedTimes.includes(slot),
    }));

    res.json({ slots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { applyDoctor, getDoctors, getDoctorById, getMyDoctorProfile, updateDoctor, getSlots };
