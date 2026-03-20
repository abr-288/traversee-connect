const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { requireAuth, isAdmin } = require('../middlewares/auth');

router.post('/send', requireAuth, isAdmin, emailController.sendDirectEmail);

module.exports = router;
