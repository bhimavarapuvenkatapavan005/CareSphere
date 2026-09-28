const router = require('express').Router();
const { applyDoctor, getDoctors, getDoctorById, getMyDoctorProfile, updateDoctor, getSlots } = require('../controllers/doctorController');
const { getDoctorReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/apply', protect, applyDoctor);
router.get('/', protect, getDoctors);
router.get('/my-profile', protect, authorize('doctor'), getMyDoctorProfile);
router.get('/:id', protect, getDoctorById);
router.put('/:id', protect, authorize('doctor'), updateDoctor);
router.get('/:id/slots', protect, getSlots);
router.get('/:id/reviews', protect, getDoctorReviews);

module.exports = router;
