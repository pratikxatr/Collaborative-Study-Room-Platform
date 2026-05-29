const crypto = require('crypto');
const Room = require('../models/Room');

const generateCode = () => crypto.randomBytes(4).toString('hex').toUpperCase();

exports.createRoom = async (req, res) => {
  try {
    const { name, description } = req.body;
    const room = await Room.create({
      name, description,
      owner: req.user.id,
      members: [req.user.id],
      inviteCode: generateCode(),
    });
    await room.populate('owner members', 'username email');
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user.id })
      .populate('owner members', 'username email')
      .select('-messages');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('owner members', 'username email')
      .populate('sessions.startedBy', 'username');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (!room.members.some(m => m._id.toString() === req.user.id))
      return res.status(403).json({ message: 'Not a member' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const room = await Room.findOne({ inviteCode });
    if (!room) return res.status(404).json({ message: 'Invalid invite code' });
    if (!room.members.includes(req.user.id)) {
      room.members.push(req.user.id);
      await room.save();
    }
    await room.populate('owner members', 'username email');
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.startSession = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.activeSession) return res.status(400).json({ message: 'Session already active' });
    room.activeSession = true;
    room.currentSessionStart = new Date();
    await room.save();
    res.json({ message: 'Session started', startTime: room.currentSessionStart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.endSession = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (!room.activeSession) return res.status(400).json({ message: 'No active session' });
    const endTime = new Date();
    const duration = Math.floor((endTime - room.currentSessionStart) / 1000);
    room.sessions.push({ startedBy: req.user.id, startTime: room.currentSessionStart, endTime, duration });
    room.activeSession = false;
    room.currentSessionStart = undefined;
    await room.save();
    res.json({ message: 'Session ended', duration });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.owner.toString() !== req.user.id)
      return res.status(403).json({ message: 'Only owner can delete room' });
    await room.deleteOne();
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
