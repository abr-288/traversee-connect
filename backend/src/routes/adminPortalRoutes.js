const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminPortalController');
const { requireAuth, isAdmin } = require('../middlewares/auth');

router.use(requireAuth, isAdmin);

// Reviews
router.get('/reviews', controller.getAllReviews);
router.put('/reviews/:id/approve', controller.approveReview);
router.delete('/reviews/:id', controller.deleteReview);

// Quotes
router.get('/quotes', controller.getAllQuotes);
router.put('/quotes/:id/respond', controller.respondToQuote);

// Tickets
router.get('/tickets', controller.getAllTickets);
router.put('/tickets/:id/status', controller.updateTicketStatus);

module.exports = router;
