const router = require('express').Router();
const {
  createUser, getUsers, toggleUser, getDoctors, approveDoctor, rejectDoctor,
  getAppointments, getAnalytics, createDoctorAccount,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.post('/users/create', createUser);
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUser);
router.get('/doctors', getDoctors);
router.post('/doctors/create', createDoctorAccount);
router.put('/doctors/:id/approve', approveDoctor);
router.put('/doctors/:id/reject', rejectDoctor);
router.get('/appointments', getAppointments);
router.get('/analytics', getAnalytics);

module.exports = router;
