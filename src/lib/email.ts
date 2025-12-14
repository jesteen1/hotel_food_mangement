import nodemailer from 'nodemailer';

const getTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

export async function sendEmail({ to, subject, html, text }: { to: string, subject: string, html: string, text?: string }) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.log("SMTP not configured. Email to:", to);
        return false;
    }

    try {
        const transporter = getTransporter();
        await transporter.sendMail({
            from: `"FoodNote" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text: text || "Email from FoodNote",
            html
        });
        console.log(`Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error("Failed to send email:", error);
        return false;
    }
}

export async function sendWelcomeEmail(email: string) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #ea580c; margin: 0;">FoodNote</h1>
        </div>
        <div style="padding: 20px; color: #333;">
            <h2 style="color: #333;">Welcome Aboard! 🎉</h2>
            <p style="font-size: 16px; line-height: 1.5;">
                Thank you for choosing <strong>FoodBook App</strong> to manage your dining and orders.
                We're excited to help you streamline your operations.
            </p>
            <p style="font-size: 16px; line-height: 1.5;">
                Get started by setting up your menu and company details in the dashboard.
            </p>
            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXTAUTH_URL}/admin" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
            </div>
        </div>
    </div>
    `;

    await sendEmail({
        to: email,
        subject: 'Welcome to FoodNote! 🏨',
        html
    });
}
