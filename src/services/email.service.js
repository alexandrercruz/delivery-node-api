const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_KEY)

module.exports = {
    async send(to, subject, body) {
        try {
            await sgMail.send({
                to: to,
                from: process.env.SENDGRID_FROM,
                subject: subject,
                html: body
            })
        } catch (error) {
            console.log(error)
        }
    }
}