import nodemailer from 'nodemailer';

export const sendEmail = async (recipients: (string | null)[], subject: string, text: string, htmlTemplate?: string) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipients.join(","),
        subject: subject,
        text: text,
        html: htmlTemplate
    }

    await transporter.sendMail(mailOptions)
}