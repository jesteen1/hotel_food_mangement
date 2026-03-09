import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, feedback, shopName, email } = await req.json();

        if (!name || !feedback) {
            return NextResponse.json({ error: "Name and Feedback are required" }, { status: 400 });
        }

        const adminEmail = "applejjbro@gmail.com";
        const subject = `New Feedback from ${shopName || session.user.email}`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #ea580c; margin: 0;">FoodNote Feedback</h1>
                </div>
                <div style="padding: 20px; color: #333;">
                    <p><strong>Shop Name:</strong> ${shopName || 'N/A'}</p>
                    <p><strong>Owner Email:</strong> ${email || session.user.email}</p>
                    <p><strong>Submitted By:</strong> ${name}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 16px; line-height: 1.5;">
                        <strong>Feedback:</strong><br>
                        ${feedback.replace(/\n/g, '<br>')}
                    </p>
                </div>
            </div>
        `;

        const success = await sendEmail({
            to: adminEmail,
            subject,
            html,
            text: `Feedback from ${name} (${shopName}): ${feedback}`
        });

        if (success) {
            return NextResponse.json({ message: "Feedback sent successfully" });
        } else {
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
        }
    } catch (error) {
        console.error("Feedback API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
