import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationEmail(email: string, otp: string): Promise<void> {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification Code',
        html: `
            <h1>Email Verification</h1>
            <p>Your verification code is: <strong>${otp}</strong></p>
            <p>This code will expire in 15 minutes.</p>
        `
    };
    await transporter.sendMail(mailOptions);
}