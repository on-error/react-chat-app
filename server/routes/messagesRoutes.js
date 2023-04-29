const {
  addMessage,
  getAllMessages,
  getUserNotifications,
  notify,
  markNotified,
} = require('../controllers/messagesController');

const router = require('express').Router();

router.post('/addMessage/', addMessage);
router.post('/getMessages/', getAllMessages);
router.get('/notifications/:id', getUserNotifications);
router.post('/notify', notify);
router.post('/markNotified', markNotified);

module.exports = router;
