const router = require('express').Router();
const { createPrescription, getMyPrescriptions, getDoctorPrescriptions, getPrescriptionById } = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('doctor'), createPrescription);
router.get('/my', protect, authorize('patient'), getMyPrescriptions);
router.get('/doctor', protect, authorize('doctor'), getDoctorPrescriptions);
router.get('/:id', protect, getPrescriptionById);

module.exports = router;
