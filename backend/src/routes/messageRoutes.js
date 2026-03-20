const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { requireAuth, isAdmin } = require('../middlewares/auth');
const { addClient, removeClient } = require('../services/messageRealtime');

// Admin SSE stream (real-time notifications for newly created messages)
router.get('/stream', requireAuth, isAdmin, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  // Needed for some proxies to flush SSE headers immediately
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  addClient(res);

  // Initial event so clients know the stream is up
  res.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);

  const heartbeat = setInterval(() => {
    try {
      res.write(`event: ping\ndata: {}\n\n`);
    } catch (e) {
      clearInterval(heartbeat);
      removeClient(res);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    removeClient(res);
  });
});

// Public: Submit form
router.post('/', messageController.createMessage);

// Admin: Manage messages
router.get('/', requireAuth, isAdmin, messageController.getMessages);
router.put('/:id/reply', requireAuth, isAdmin, messageController.replyToMessage);
router.patch('/:id/read', requireAuth, isAdmin, messageController.markAsRead);
router.delete('/:id', requireAuth, isAdmin, messageController.deleteMessage);

module.exports = router;
