const router = require('express').Router();
const { getNotifications, markRead, markAllRead, deleteRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllRead);
router.delete('/read', protect, deleteRead);
router.put('/:id/read', protect, markRead);

module.exports = router;
