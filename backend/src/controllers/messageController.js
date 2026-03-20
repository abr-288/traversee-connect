const prisma = require('../config/prisma');
const { broadcastMessageCreated } = require('../services/messageRealtime');

// Public: Submit form
exports.createMessage = async (req, res) => {
    const { name, email, subject, message } = req.body;
    try {
        const newMessage = await prisma.message.create({
            data: { name, email, subject, message }
        });
        // Real-time notification for admin dashboard.
        // (SSE broadcaster is in-memory; per-process)
        try {
            broadcastMessageCreated(newMessage);
        } catch (e) {
            // Never fail the request because realtime notifications failed.
            console.error('Realtime broadcast failed:', e);
        }
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: List all
exports.getMessages = async (req, res) => {
    try {
        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const emailService = require('../services/emailService');

// Admin: Reply
exports.replyToMessage = async (req, res) => {
    const { id } = req.params;
    const { replyText } = req.body;
    try {
        const message = await prisma.message.findUnique({ where: { id } });
        if (!message) return res.status(404).json({ message: 'Message non trouvé' });

        const updated = await prisma.message.update({
            where: { id },
            data: {
                replyText,
                replied: true,
                read: true
            }
        });

        // Actually SEND an email to the user
        try {
            await emailService.sendEmail({
                to: message.email,
                subject: `Réponse à votre message : ${message.subject || 'Sans objet'}`,
                text: replyText,
                html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #3b82f6;">Re: ${message.subject || 'Votre message'}</h2>
                    <p>Bonjour ${message.name},</p>
                    <p>Nous avons bien reçu votre message et voici notre réponse :</p>
                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        ${replyText.replace(/\n/g, '<br>')}
                    </div>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #6b7280; font-size: 12px;">Cet email a été envoyé par la plateforme ONESKY.</p>
                </div>`
            });
        } catch (mailError) {
            console.error('Mail delivery failed, but record updated:', mailError);
        }

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Mark as read
exports.markAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.message.update({
            where: { id },
            data: { read: true }
        });
        res.json({ message: 'Message marqué comme lu' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Delete
exports.deleteMessage = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.message.delete({ where: { id } });
        res.json({ message: 'Message supprimé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
