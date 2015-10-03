var nodemailer = require('nodemailer');
var config = require('config');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.email.address,
        pass: config.email.password
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
