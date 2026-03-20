const prisma = require('../config/prisma');

// REVIEWS
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            include: { user: true, product: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.approveReview = async (req, res) => {
    const { id } = req.params;
    try {
        const review = await prisma.review.update({
            where: { id },
            data: { approved: true }
        });
        res.json(review);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteReview = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.review.delete({ where: { id } });
        res.json({ message: 'Avis supprimé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// QUOTES
exports.getAllQuotes = async (req, res) => {
    try {
        const quotes = await prisma.quoteRequest.findMany({
            include: { user: true, product: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(quotes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.respondToQuote = async (req, res) => {
    const { id } = req.params;
    const { response, status } = req.body;
    try {
        const quote = await prisma.quoteRequest.update({
            where: { id },
            data: { response, status: status || 'COMPLETED' }
        });
        res.json(quote);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// TICKETS
exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await prisma.supportTicket.findMany({
            include: { user: true, responses: true },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateTicketStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const ticket = await prisma.supportTicket.update({
            where: { id },
            data: { status }
        });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
