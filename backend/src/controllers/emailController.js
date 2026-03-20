const emailService = require('../services/emailService');

exports.sendDirectEmail = async (req, res) => {
    const { to, subject, body } = req.body;
    try {
        await emailService.sendEmail({
            to,
            subject,
            text: body,
            html: `<div style="font-family: sans-serif; padding: 20px;">${body.replace(/\n/g, '<br>')}</div>`
        });
        res.json({ message: 'Email envoyé avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
