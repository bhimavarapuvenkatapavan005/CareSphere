const router = require('express').Router();
const { createReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('patient'), createReview);

module.exports = router;
