const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const { requireAuth, isAdmin } = require('../middlewares/auth');

router.get('/', requireAuth, isAdmin, pageController.getAllPages);
router.post('/', requireAuth, isAdmin, pageController.createPage);
router.get('/:id', requireAuth, isAdmin, pageController.getPageById);
router.delete('/:id', requireAuth, isAdmin, pageController.deletePage);
router.post('/:pageId/sections', requireAuth, isAdmin, pageController.createSection);
router.put('/:pageId/sections/:sectionId', requireAuth, isAdmin, pageController.updateSection);
router.delete('/:pageId/sections/:sectionId', requireAuth, isAdmin, pageController.deleteSection);
router.post('/seed', pageController.seed);

// Public routes for the main site
router.get('/public/:id', pageController.getPageById);

module.exports = router;