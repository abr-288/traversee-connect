const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, isAdmin } = require('../middlewares/auth');

router.get('/', requireAuth, isAdmin, userController.getUsers);
router.post('/', requireAuth, isAdmin, userController.createUser);
router.put('/:id', requireAuth, isAdmin, userController.updateUser);
router.put('/:id/role', requireAuth, isAdmin, userController.updateUserRole);
router.delete('/:id', requireAuth, isAdmin, userController.deleteUser);

module.exports = router;
