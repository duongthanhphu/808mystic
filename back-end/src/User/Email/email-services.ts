import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export async function sendOtpEmail(userEmail: string, otp: string): Promise<void> {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Mã xác nhận OTP của bạn',
    html: `<h3>Chào bạn!</h3><p>Mã xác nhận OTP của bạn là: <b>${otp}</b></p>`,
  };

  await transporter.sendMail(mailOptions);
}
