const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createRoom, getMyRooms, getRoom, joinRoom,
  startSession, endSession, deleteRoom
} = require('../controllers/roomController');

router.post('/', auth, createRoom);
router.get('/', auth, getMyRooms);
router.get('/:id', auth, getRoom);
router.post('/join', auth, joinRoom);
router.post('/:id/start', auth, startSession);
router.post('/:id/end', auth, endSession);
router.delete('/:id', auth, deleteRoom);

module.exports = router;
