const Notification = require('../models/Notification');

const createNotification = async (userId, message, type = 'general', link = '') => {
  try {
    await Notification.create({ userId, message, type, link });
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

module.exports = { createNotification };
