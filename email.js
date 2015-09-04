var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'peter@intergalacticlabs.co',
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 * Sends an email to someone
 * @type {Function}
 */
var send = module.exports.send = function(to, subject, text, callback) {
    transporter.sendMail({
        from: 'noreply@intergalacticlabs.co',
        to: to,
        subject: subject,
        text: text
    });

    if (typeof callback === 'function') {
        callback();
    }
};
