const express = require('express');
const router  = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// IMPORTANT: specific routes must come BEFORE /:userId param route

// GET /api/messages/conversations
router.get('/conversations', protect, async (req, res) => {
  try {
    const uid  = req.user._id;
    const msgs = await Message.find({ $or:[{ sender:uid },{ receiver:uid }] })
      .populate('sender',   'name avatar role')
      .populate('receiver', 'name avatar role')
      .sort({ createdAt: -1 });

    const seen = new Map();
    for (const m of msgs) {
      const sId = m.sender._id.toString();
      const rId = m.receiver._id.toString();
      const uId = uid.toString();
      const other = sId === uId ? m.receiver : m.sender;
      const key   = other._id.toString();
      if (!seen.has(key)) {
        seen.set(key, {
          user: other,
          lastMessage: m.content,
          lastAt: m.createdAt,
          unread: rId === uId && !m.read ? 1 : 0,
        });
      } else if (rId === uId && !m.read) {
        seen.get(key).unread += 1;
      }
    }
    res.json({ success:true, conversations: Array.from(seen.values()) });
  } catch (err) { res.status(500).json({ message:err.message }); }
});

// GET /api/messages/unread/count — MUST be before /:userId
router.get('/unread/count', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiver:req.user._id, read:false });
    res.json({ success:true, count });
  } catch (err) { res.status(500).json({ message:err.message }); }
});

// GET /api/messages/:userId — full chat thread
router.get('/:userId', protect, async (req, res) => {
  try {
    const uid   = req.user._id;
    const other = req.params.userId;
    const messages = await Message.find({
      $or:[
        { sender:uid,   receiver:other },
        { sender:other, receiver:uid   },
      ]
    }).populate('sender',   'name avatar role')
      .populate('receiver', 'name avatar role')
      .sort({ createdAt: 1 });
    await Message.updateMany({ sender:other, receiver:uid, read:false }, { read:true });
    res.json({ success:true, messages });
  } catch (err) { res.status(500).json({ message:err.message }); }
});

// POST /api/messages — send
router.post('/', protect, async (req, res) => {
  try {
    const { receiver, content, ngoContext } = req.body;
    if (!receiver || !content?.trim())
      return res.status(400).json({ message:'Receiver and content required' });
    if (receiver === req.user._id.toString())
      return res.status(400).json({ message:'Cannot message yourself' });
    const msg = await Message.create({
      sender: req.user._id,
      receiver,
      content: content.trim(),
      ngoContext: ngoContext || null,
    });
    await msg.populate('sender',   'name avatar role');
    await msg.populate('receiver', 'name avatar role');
    res.status(201).json({ success:true, message:msg });
  } catch (err) { res.status(500).json({ message:err.message }); }
});

module.exports = router;
