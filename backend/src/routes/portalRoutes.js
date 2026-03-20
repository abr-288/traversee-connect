const express = require('express');
const router = express.Router();
const portalController = require('../controllers/userPortalController');
const { requireAuth } = require('../middlewares/auth');

router.use(requireAuth);

// Reviews
router.post('/reviews', portalController.createReview);
router.get('/my-reviews', portalController.getMyReviews);

// Quotes
router.post('/quotes', portalController.createQuoteRequest);
router.get('/my-quotes', portalController.getMyQuoteRequests);

// Activity
router.get('/login-logs', portalController.getLoginLogs);

// Support
router.post('/tickets', portalController.createTicket);
router.get('/my-tickets', portalController.getMyTickets);
router.post('/tickets/:ticketId/reply', portalController.replyToTicket);

module.exports = router;
