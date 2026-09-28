const router = require('express').Router();
const { createAppointment, getMyAppointments, getDoctorAppointments, updateStatus, rescheduleAppointment, cancelAppointment } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, authorize('patient'), upload.single('document'), createAppointment);
router.get('/my', protect, authorize('patient'), getMyAppointments);
router.get('/doctor', protect, authorize('doctor'), getDoctorAppointments);
router.put('/:id/status', protect, authorize('doctor', 'admin'), updateStatus);
router.put('/:id/reschedule', protect, authorize('patient'), rescheduleAppointment);
router.delete('/:id', protect, cancelAppointment);

module.exports = router;
