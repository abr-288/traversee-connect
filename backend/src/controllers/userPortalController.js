const prisma = require('../config/prisma');

// REVIEWS
exports.createReview = async (req, res) => {
    const { rating, comment, productId } = req.body;
    try {
        const review = await prisma.review.create({
            data: {
                rating: parseInt(rating),
                comment,
                userId: req.user.id,
                productId
            }
        });
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { userId: req.user.id },
            include: { product: true }
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// QUOTE REQUESTS
exports.createQuoteRequest = async (req, res) => {
    const { subject, description, productId } = req.body;
    try {
        const quote = await prisma.quoteRequest.create({
            data: {
                subject,
                description,
                userId: req.user.id,
                productId
            }
        });
        res.status(201).json(quote);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMyQuoteRequests = async (req, res) => {
    try {
        const quotes = await prisma.quoteRequest.findMany({
            where: { userId: req.user.id },
            include: { product: true }
        });
        res.json(quotes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// LOGIN LOGS
exports.getLoginLogs = async (req, res) => {
    try {
        const logs = await prisma.loginLog.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// SUPPORT TICKETS
exports.createTicket = async (req, res) => {
    const { subject, message, priority } = req.body;
    try {
        const ticket = await prisma.supportTicket.create({
            data: {
                subject,
                message,
                priority: priority || 'NORMAL',
                userId: req.user.id
            }
        });
        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMyTickets = async (req, res) => {
    try {
        const tickets = await prisma.supportTicket.findMany({
            where: { userId: req.user.id },
            include: { 
                responses: {
                    orderBy: { createdAt: 'asc' }
                } 
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.replyToTicket = async (req, res) => {
    const { ticketId } = req.params;
    const { message } = req.body;
    try {
        const response = await prisma.ticketResponse.create({
            data: {
                message,
                ticketId,
                userId: req.user.id,
                isAdmin: req.user.role === 'ADMIN'
            }
        });
        
        await prisma.supportTicket.update({
            where: { id: ticketId },
            data: { updatedAt: new Date() }
        });

        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
