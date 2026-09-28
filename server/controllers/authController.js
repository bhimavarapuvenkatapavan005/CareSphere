const User = require('../models/User');
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const buildUserResponse = async (user) => {
  // Always fetch fresh role from DB
  const fresh = await User.findById(user._id).select('-password');
  let doctorId = null;
  if (fresh.role === 'doctor') {
    const doc = await Doctor.findOne({ userId: fresh._id });
    doctorId = doc?._id || null;
  }
  return {
    _id: fresh._id,
    name: fresh.name,
    email: fresh.email,
    role: fresh.role,
    phone: fresh.phone,
    profilePhoto: fresh.profilePhoto,
    doctorId,
  };
};

// POST /api/auth/register  — public, always creates a patient
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone)
      return res.status(400).json({ message: 'All fields are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, phone, role: 'patient' });
    const userData = await buildUserResponse(user);
    res.status(201).json({ token: generateToken(user._id), user: userData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    if (!user.isActive)
      return res.status(403).json({ message: 'Account has been disabled' });

    const userData = await buildUserResponse(user);
    res.json({ token: generateToken(user._id), user: userData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const userData = await buildUserResponse(req.user);
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getMe };
