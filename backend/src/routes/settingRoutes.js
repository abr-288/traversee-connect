const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { requireAuth, isAdmin } = require('../middlewares/auth');

router.get('/', settingController.getSettings);
router.put('/', requireAuth, isAdmin, settingController.updateSettings);

module.exports = router;
