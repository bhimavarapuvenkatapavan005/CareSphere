require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await User.deleteMany({ role: { $in: ['admin', 'doctor'] } });
  await Doctor.deleteMany({});
  console.log('Cleared — now run: npm run seed');
  process.exit();
}).catch(e => { console.log(e.message); process.exit(); });
