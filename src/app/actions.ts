'use server';

import connectToDatabase from '@/lib/db';
import { Product, Order, IProduct, Settings } from '@/lib/models';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { cookies } from 'next/headers';

// --- AUTH ACTIONS ---

export async function login(role: string, password: string) {
    try {
        await connectToDatabase();
        const settings = await Settings.findOne();

        if (!settings) {
            return { success: false, error: "Settings not found" };
        }

        const validPassword = settings.auth[role as keyof typeof settings.auth];

        if (password === validPassword) {
            // Set cookie
            (await cookies()).set('hotel_role', role, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                maxAge: 60 * 60 * 24 // 1 day
            });
            return { success: true };
        }

        return { success: false, error: "Invalid password" };
    } catch (error) {
        console.error("Login Error:", error);
        return { success: false, error: "Login failed" };
    }
}

export async function logout() {
    (await cookies()).delete('hotel_role');
    return { success: true };
}

export async function getSession() {
    const role = (await cookies()).get('hotel_role')?.value;
    return { role };
}

export async function updatePassword(targetRole: string, newPassword: string) {
    try {
        await connectToDatabase();

        // internal check: only master can update
        const session = await getSession();
        if (session.role !== 'master') {
            return { success: false, error: "Unauthorized" };
        }

        const settings = await Settings.findOne();
        if (!settings) return { success: false, error: "Settings not found" };

        settings.auth[targetRole as keyof typeof settings.auth] = newPassword;
        await settings.save();

        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error) {
        console.error("Update Password Error:", error);
        return { success: false, error: "Update failed" };
    }
}

export async function getAuthSettings() {
    try {
        await connectToDatabase();
        const settings = await Settings.findOne().lean();
        if (!settings) return null;

        // Return full auth object (passwords included) for Master to view
        const session = await getSession();
        if (session.role === 'master') {
            return JSON.parse(JSON.stringify(settings.auth));
        }

        // Return only keys, not passwords
        return Object.keys(settings.auth);
    } catch (error) {
        console.error("Get Settings Error:", error);
        return [];
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


// --- Products ---

export async function getProducts() {
    try {
        await connectToDatabase();
        // Force Mongoose to return POJOs
        const products = await Product.find({}).lean();
        return JSON.parse(JSON.stringify(products));
    } catch (error) {
        console.error("Database connection failed:", error);
        // Fallback only to empty array or throw, but for now we want to see if real DB works
        return [];
    }
}

export async function createProduct(data: Partial<IProduct>) {
    await connectToDatabase();
    const product = await Product.create(data);
    revalidatePath('/admin/inventory');
    revalidatePath('/menu');
    return JSON.parse(JSON.stringify(product));
}

export async function updateProductStock(id: string, stock: number) {
    await connectToDatabase();
    await Product.findByIdAndUpdate(id, { stock });
    revalidatePath('/admin/inventory');
    revalidatePath('/menu');
}

export async function updateProduct(id: string, data: Partial<IProduct>) {
    await connectToDatabase();
    await Product.findByIdAndUpdate(id, data);
    revalidatePath('/admin/inventory');
    revalidatePath('/menu');
}

export async function deleteProduct(id: string) {
    console.log("Server deleting product:", id);
    try {
        await connectToDatabase();
        const result = await Product.findByIdAndDelete(id);
        console.log("Delete result:", result);
        revalidatePath('/admin/inventory');
        revalidatePath('/menu');
    } catch (error) {
        console.error("Server delete failed:", error);
        throw error;
    }
}

// --- Orders ---

export async function createOrder(seatNumber: string, items: { productId: string; quantity: number }[]) {
    await connectToDatabase();

    try {
        let total = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) continue;

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

        const order = await Order.create({
            seatNumber,
            items: orderItems,
            totalAmount: total,
            status: 'Pending'
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
        const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(orders));
    } catch (error) {
        console.error("Failed to fetch orders", error);
        return [];
    }
}

export async function updateOrderStatus(id: string, status: string) {
    await connectToDatabase();
    await Order.findByIdAndUpdate(id, { status });
    revalidatePath('/admin');
}

// --- Billing ---

export async function getBill(seatNumber: string) {
    try {
        await connectToDatabase();
        const orders = await Order.find({
            seatNumber,
            status: 'Completed'
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

        return {
            seatNumber,
            ordersCount: orders.length,
            items: allItems,
            grandTotal
        };

    } catch (error) {
        console.error("Failed to get bill", error);
        return null;
    }
}

export async function closeBill(seatNumber: string) {
    console.log("Closing bill for seat:", seatNumber);
    try {
        await connectToDatabase();
        const result = await Order.updateMany(
            { seatNumber, status: 'Completed' },
            { $set: { status: 'Paid' } }
        );
        console.log("Update result:", result);

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

export async function seedInitialData() {
    // No-op or call seed script logic here if wanted, but generally we rely on external seed now
}
