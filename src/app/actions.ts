'use server';

export async function manualSeed() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: "Not logged in" };

    // Dynamic import to avoid bundling issues
    const { seedDefaultProducts } = await import("@/lib/seeder");
    await seedDefaultProducts(session.user.email);

    revalidatePath('/admin/inventory');
    revalidatePath('/menu');
    return { success: true };
}

import connectToDatabase from '@/lib/db';
import { Product, Order, Settings, User, Otp, IProduct } from '@/lib/models';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- AUTH & USER ACTIONS ---

async function getOwnerEmail() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        throw new Error("Unauthorized: No session found");
    }
    return session.user.email;
}

export async function getUserSession() {
    return getServerSession(authOptions);
}

export async function updateCompanyName(companyName: string) {
    try {
        await connectToDatabase();
        const email = await getOwnerEmail();
        await User.findOneAndUpdate({ email }, { companyName });
        return { success: true };
    } catch (error) {
        console.error("Update Company Name Error:", error);
        return { success: false, error: "Update failed" };
    }
}

export async function uploadImage(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) {
        throw new Error('No file uploaded');
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitize filename
    const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const filename = uniqueSuffix + '-' + safeName;

    // Ensure upload dir exists
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return `/uploads/${filename}`;
}

// --- Settings & Security ---

export async function getAuthSettings() {
    try {
        await connectToDatabase();
        const email = await getOwnerEmail();

        // Find existing settings
        let settings = await Settings.findOne({ ownerEmail: email }).lean();

        if (!settings) {
            // Create default settings if not exists
            const newSettings = await Settings.create({
                ownerEmail: email,
                auth: {
                    chief: 'admin123',
                    inventory: 'admin123',
                    billing: 'admin123',
                    menu: 'admin123',
                    master: 'admin123'
                }
            });
            // Convert to plain object if created
            settings = JSON.parse(JSON.stringify(newSettings));
        }

        // Return just the auth object
        return JSON.parse(JSON.stringify((settings as any).auth));
    } catch (error) {
        console.error("Get Settings Error:", error);
        return null;
    }
}

export async function updatePassword(role: string, newPass: string) {
    try {
        const validRoles = ['chief', 'inventory', 'billing', 'menu', 'master'];
        if (!validRoles.includes(role)) {
            return { success: false, error: "Invalid role" };
        }

        await connectToDatabase();
        const email = await getOwnerEmail();

        // Use $set to update nested field
        const updatedSettings = await Settings.findOneAndUpdate(
            { ownerEmail: email },
            { $set: { [`auth.${role}`]: newPass } },
            { upsert: true, new: true }
        );

        // Check if ALL role passwords are secure (not default 'admin123')
        const auth = updatedSettings.auth || {};
        const roles = ['chief', 'inventory', 'billing', 'menu'];
        const allSecure = roles.every(r => (auth as any)[r] && (auth as any)[r] !== 'admin123');

        // Update User status based on security check
        await User.findOneAndUpdate(
            { email },
            { hasSetPassword: allSecure }
        );

        revalidatePath('/admin', 'layout');
        return { success: true };

    } catch (error) {
        console.error("Update Password Error:", error);
        return { success: false, error: "Update failed" };
    }
}

export async function verifyRolePassword(role: string, password: string) {
    try {
        await connectToDatabase();
        const settings = await getAuthSettings();

        if (!settings) return { success: false, error: "Settings not found" };

        const storedPassword = settings[role];
        // Since we are storing plain text passwords as per current implementation (based on SettingsClient)
        // We simple compare. Ideally, this should be hashed.

        if (storedPassword === password) {
            return { success: true };
        }

        return { success: false, error: "Incorrect Password" };
    } catch (error) {
        console.error("Verify Password Error:", error);
        return { success: false, error: "Verification failed" };
    }
}



// --- Products ---

export async function getProducts() {
    try {
        await connectToDatabase();
        // Public for now? Or should only owner see?
        // User said: "fresh signup... modified inventory... save in their google account only".
        // This implies Public viewers (ordering food) need to see specific owner's products. 
        // BUT, how does the public user know WHICH owner's menu to see?
        // Usually, the app would be subdomained or have a store ID.
        // For this single-app demo, we might need to rely on the logged-in Admin seeing their own products.
        // What about the "Client Portal" (ordering)? 
        // If I am a customer sitting in the cinema, I scan a QR code. That code usually links to the specific cinema's menu.
        // Given constraint: "allow google auth... save in their google account".
        // I will assume for now:
        // 1. Admin uses Google Auth -> Sees their products.
        // 2. Client (Ordering flow) -> Currently the app creates orders without auth. 
        //    CRITICAL: The client needs to know WHO they are ordering from.
        //    Ideally, query param `?shop=ownerEmail` or we assume the "User" IS the shop owner and they are using the app on a tablet given to the customer?
        //    Or maybe the Admin logs in on the "Kiosk"?
        //    Let's stick to: "Authenticated user sees their stuff".
        //    For the "Menu" page (public), we currently fetch `getProducts`. 
        //    If we make `getProducts` protected, public users can't see menu.
        //    
        //    Compromise: `getProducts` returns ALL products if no owner specified? Or we filter by a hardcoded owner for "Main" view?
        //    Actually, if I am "Fresh Login", I get "Fresh Inventory".
        //    So `getProducts` MUST filter by `ownerEmail` of the logged-in user.
        //    This means to ORDER, you must be logged in as the owner (Kiosk mode)? 
        //    Or we need a way to fetch public products for a specific shop.
        //    
        //    Let's implement `getProducts` to require auth for Management. 
        //    For Public menu, we might need a separate action `getShopProducts(ownerEmail)`.
        //    But `src/app/menu/page.tsx` calls `getProducts`.
        //    I will make `getProducts` try to get session. If session exists, return owner's products.

        const session = await getServerSession(authOptions);
        if (session?.user?.email) {
            const products = await Product.find({ ownerEmail: session.user.email }).lean();
            return JSON.parse(JSON.stringify(products));
        }

        // Fallback for non-logged in users (e.g. initial demo)? 
        // Or return empty? Returning empty ensures "Fresh Signup" experience.
        return [];
    } catch (error) {
        console.error("Database connection failed:", error);
        return [];
    }
}

export async function createProduct(data: Partial<IProduct>) {
    await connectToDatabase();
    const email = await getOwnerEmail();
    const product = await Product.create({ ...data, ownerEmail: email });
    revalidatePath('/admin/inventory');
    revalidatePath('/menu');
    return JSON.parse(JSON.stringify(product));
}

export async function updateProductStock(id: string, stock: number) {
    await connectToDatabase();
    const email = await getOwnerEmail();
    await Product.findOneAndUpdate({ _id: id, ownerEmail: email }, { stock });
    revalidatePath('/admin/inventory');
    revalidatePath('/menu');
}

export async function updateProduct(id: string, data: Partial<IProduct>) {
    await connectToDatabase();
    const email = await getOwnerEmail();
    await Product.findOneAndUpdate({ _id: id, ownerEmail: email }, data);
    revalidatePath('/admin/inventory');
    revalidatePath('/menu');
}

export async function deleteProduct(id: string) {
    try {
        await connectToDatabase();
        const email = await getOwnerEmail();
        const result = await Product.findOneAndDelete({ _id: id, ownerEmail: email });
        revalidatePath('/admin/inventory');
        revalidatePath('/menu');
    } catch (error) {
        console.error("Server delete failed:", error);
        throw error;
    }
}

// --- Orders ---

export async function createOrder(
    seatNumber: string,
    items: { productId: string; quantity: number }[],
    foodNote?: string,
    applyTax: boolean = false
) {
    await connectToDatabase();

    // Who is the owner? The person creating the order might be a guest.
    // If guest, how do we assign owner?
    // We need the `ownerEmail` of the product to know who gets the order.
    // We assume all items belong to the SAME owner (Cart should enforce this, or we just handle it).
    // Let's take the first product's owner.

    // Security risk: Guest could theoretically mix products?
    // For now, let's fetch the first product to determine the owner.

    if (items.length === 0) throw new Error("No items");

    const firstProduct = await Product.findById(items[0].productId);
    if (!firstProduct) throw new Error("Product not found");

    const ownerEmail = firstProduct.ownerEmail; // The shop owner

    try {
        let total = 0;
        const orderItems = [];

        for (const item of items) {
            // Verify product belongs to same owner
            const product = await Product.findOne({ _id: item.productId, ownerEmail });
            if (!product) throw new Error(`Product invalid or mixed owners`);

            if (product.stock < item.quantity) {
                throw new Error(`Not enough stock for ${product.name}`);
            }

            product.stock -= item.quantity;
            await product.save();
            total += product.price * item.quantity;
            orderItems.push({
                product: product._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price
            });
        }

        let taxAmount = 0;
        if (applyTax) {
            taxAmount = Math.round(total * 0.18);
            total += taxAmount;
        }

        const order = await Order.create({
            seatNumber,
            items: orderItems,
            totalAmount: total,
            status: 'Pending',
            foodNote: foodNote || '',
            taxAmount,
            ownerEmail
        });

        revalidatePath('/admin');
        return JSON.parse(JSON.stringify(order));
    } catch (error) {
        console.error("Failed to create order", error);
        throw error;
    }
}

export async function getOrders() {
    try {
        await connectToDatabase();
        const email = await getOwnerEmail();
        const orders = await Order.find({ ownerEmail: email }).sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(orders));
    } catch (error) {
        console.error("Failed to fetch orders", error);
        return [];
    }
}

export async function updateOrderStatus(id: string, status: string) {
    await connectToDatabase();
    const email = await getOwnerEmail();
    await Order.findOneAndUpdate({ _id: id, ownerEmail: email }, { status });
    revalidatePath('/admin');
}

// --- Billing ---

export async function getBill(seatNumber: string) {
    try {
        await connectToDatabase();
        const email = await getOwnerEmail(); // Admin requesting bill

        const orders = await Order.find({
            seatNumber,
            status: 'Completed',
            ownerEmail: email
        }).lean();

        if (!orders || orders.length === 0) {
            return null;
        }

        let grandTotal = 0;
        const allItems: any[] = [];

        orders.forEach((order: any) => {
            grandTotal += order.totalAmount;
            order.items.forEach((item: any) => {
                allItems.push({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.price * item.quantity
                });
            });
        });

        const user = await User.findOne({ email });

        return {
            seatNumber,
            ordersCount: orders.length,
            items: allItems,
            grandTotal,
            companyName: user?.companyName || "FOODBOOK",
            foodNote: orders[0]?.foodNote // Getting note from first order for simplicity or aggregate?
        };

    } catch (error) {
        console.error("Failed to get bill", error);
        return null;
    }
}

export async function closeBill(seatNumber: string) {
    try {
        await connectToDatabase();
        const email = await getOwnerEmail();
        const result = await Order.updateMany(
            { seatNumber, status: 'Completed', ownerEmail: email },
            { $set: { status: 'Paid' } }
        );

        revalidatePath('/admin');
        revalidatePath('/admin/billing');

        if (result.modifiedCount === 0 && result.matchedCount === 0) {
            return { success: false, error: 'No completed orders found to pay' };
        }

        return { success: true, count: result.modifiedCount };
    } catch (error) {
        console.error("Error closing bill:", error);
        return { success: false, error: 'Failed to close bill' };
    }
}

export async function removeItemFromBill(seatNumber: string, itemName: string) {
    try {
        await connectToDatabase();
        const email = await getOwnerEmail();
        const orders = await Order.find({ seatNumber, status: 'Completed', ownerEmail: email });

        for (const order of orders) {
            const itemIndex = order.items.findIndex((i: any) => i.name === itemName);

            if (itemIndex > -1) {
                const item = order.items[itemIndex];

                if (item.quantity > 1) {
                    item.quantity -= 1;
                } else {
                    order.items.splice(itemIndex, 1);
                }

                // Recalculate Order Total
                order.totalAmount = order.items.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0);

                // Re-apply tax if it was there? Complex. For now simplify.
                if (order.taxAmount) {
                    // Recalc tax
                    const sub = order.items.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0);
                    order.taxAmount = Math.round(sub * 0.18);
                    order.totalAmount = sub + order.taxAmount;
                }

                if (order.items.length === 0) {
                    await Order.findByIdAndDelete(order._id);
                } else {
                    await order.save();
                }

                revalidatePath('/admin/billing');
                return { success: true };
            }
        }

        return { success: false, error: 'Item not found in any active order' };

    } catch (error) {
        console.error("Remove item failed:", error);
        return { success: false, error: 'Failed to remove item' };
    }
}

export async function addItemToBill(seatNumber: string, productId: string) {
    try {
        await connectToDatabase();
        const email = await getOwnerEmail();
        const product = await Product.findOne({ _id: productId, ownerEmail: email });
        if (!product) return { success: false, error: 'Product not found' };

        if (product.stock < 1) return { success: false, error: 'Out of Stock' };

        product.stock -= 1;
        await product.save();

        const order = await Order.create({
            seatNumber,
            items: [{
                product: product._id,
                name: product.name,
                quantity: 1,
                price: product.price
            }],
            totalAmount: product.price,
            status: 'Completed',
            ownerEmail: email
        });

        revalidatePath('/admin/billing');
        return { success: true };

    } catch (error) {
        console.error("Add item failed:", error);
        return { success: false, error: 'Failed to add item' };
    }
}


export async function sendOtp(email: string, type: 'login' | 'signup' | 'security' | 'delete_account' = 'login') {
    try {
        await connectToDatabase();

        const userExists = await User.findOne({ email });

        if (type === 'login' && !userExists) return { success: false, error: 'UserNotFound' };
        if (type === 'signup' && userExists) return { success: false, error: 'UserExists' };
        // Security checks
        if ((type === 'security' || type === 'delete_account') && !userExists) return { success: false, error: 'UserNotFound' };

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await Otp.deleteMany({ email });
        await Otp.create({ email, otp, expiresAt });

        if (process.env.SMTP_HOST && process.env.SMTP_USER) {
            const nodemailer = (await import('nodemailer')).default;
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: false,
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
            });

            let subject = 'Your Login Code - FoodNote';
            let title = 'Your login verification code is:';
            let color = '#ea580c'; // Orange

            if (type === 'signup') {
                subject = 'Verify & Welcome to FoodNote! 🎉';
                title = 'Verify your email to create your account:';
                color = '#166534'; // Green
            } else if (type === 'security') {
                subject = 'Security Verification - Action Required 🛡️';
                title = 'Verify your identity for Admin Settings access:';
                color = '#dc2626'; // Red
            } else if (type === 'delete_account') {
                subject = '⚠️ URGENT: Account Deletion Request';
                title = 'Use this code to PERMANENTLY DELETE your account:';
                color = '#991b1b'; // Dark Red
            }

            const htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: ${color}; margin: 0;">${type === 'delete_account' ? 'DELETE ACCOUNT' : (type === 'signup' ? 'Welcome to FoodBook!' : (type === 'login' ? 'FoodBook Login' : 'FoodBook Security'))}</h1>
                    </div>
                    <div style="background-color: ${type === 'delete_account' ? '#fef2f2' : (type === 'signup' ? '#f0fdf4' : '#f8fafc')}; padding: 20px; border-radius: 8px; text-align: center; border-left: 5px solid ${color};">
                        ${type === 'signup' ? '<p style="margin: 0 0 15px; color: #166534; font-size: 18px; font-weight: bold;">Thanks for starting your journey with us! 🚀</p>' : ''}
                        <p style="margin: 0 0 10px; color: #333; font-size: 16px;">${title}</p>
                        <h2 style="margin: 0; color: ${color}; letter-spacing: 5px; font-size: 32px;">${otp}</h2>
                        <p style="margin: 10px 0 0; color: #666; font-size: 14px;">This code expires in 5 minutes.</p>
                    </div>
                    ${type === 'delete_account' ? `
                    <div style="margin-top: 20px; font-size: 14px; color: #dc2626; text-align: center; font-weight: bold;">
                        <p>WARNING: This action is irreversible. All your data will be lost forever.</p>
                    </div>` : ''}
                </div>
            `;

            await transporter.sendMail({
                from: `"FoodNote Security" <${process.env.SMTP_USER}>`,
                to: email,
                subject: subject,
                html: htmlContent
            });
            console.log(`OTP sent to ${email} via SMTP`);
        } else {
            console.log(`[DEV MODE] ${type.toUpperCase()} OTP for ${email}: ${otp}`);
        }

        return { success: true, mode: (process.env.SMTP_HOST ? 'smtp' : 'dev'), otp: (process.env.SMTP_HOST ? undefined : otp) };

    } catch (error) {
        console.error("Send OTP Error:", error);
        return { success: false, error: "Failed to send OTP" };
    }
}

export async function deleteAccount(otp: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return { success: false, error: "Unauthorized" };

        await connectToDatabase();
        const email = session.user.email;

        // Verify OTP
        const otpRecord = await Otp.findOne({ email });
        if (!otpRecord) return { success: false, error: 'Invalid or expired OTP' };
        if (otpRecord.otp !== otp) return { success: false, error: 'Invalid OTP' };

        await Otp.deleteOne({ _id: otpRecord._id });

        // Delete Data
        await Promise.all([
            User.deleteOne({ email }),
            Settings.deleteOne({ ownerEmail: email }),
            Product.deleteMany({ ownerEmail: email }),
            Order.deleteMany({ ownerEmail: email })
        ]);

        return { success: true };
    } catch (error) {
        console.error("Delete Account Error:", error);
        return { success: false, error: "Failed to delete account" };
    }
}

// sendWelcomeEmail moved to @/lib/email.ts to avoid circular deps

export async function setPassword(password: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: "Unauthorized" };

    try {
        // Server-Side Validation
        if (!password || password.length < 8) {
            return { success: false, error: "Password must be at least 8 characters long" };
        }
        if (!/[a-zA-Z]/.test(password)) {
            return { success: false, error: "Password must contain at least one letter" };
        }
        if (!/\d/.test(password)) {
            return { success: false, error: "Password must contain at least one number" };
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return { success: false, error: "Password must contain at least one special character" };
        }

        await connectToDatabase();
        // Dynamic import bcrypt
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.findOneAndUpdate(
            { email: session.user.email },
            {
                password: hashedPassword,
                hasSetPassword: true
            }
        );

        revalidatePath('/admin', 'layout');
        return { success: true };
    } catch (error) {
        console.error("Set Password Error:", error);
        return { success: false, error: "Failed to set password" };
    }
}

export async function verifyStepUpOtp(email: string, otp: string) {
    try {
        await connectToDatabase();
        const otpRecord = await Otp.findOne({ email });

        if (!otpRecord) return { success: false, error: 'Invalid or expired OTP' };
        if (otpRecord.otp !== otp) return { success: false, error: 'Invalid OTP' };
        if (new Date() > otpRecord.expiresAt) return { success: false, error: 'OTP Expired' };

        // Valid - Delete used OTP
        await Otp.deleteOne({ _id: otpRecord._id });
        return { success: true };
    } catch (error) {
        console.error("Step-up Verify Error:", error);
        return { success: false, error: "Verification failed" };
    }
}
