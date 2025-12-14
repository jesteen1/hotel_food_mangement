
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Product } from '@/lib/models';

export async function GET() {
    try {
        await connectToDatabase();

        const newItem = {
            name: "Coconut Milk Payasam",
            description: "Traditional creamy coconut milk dessert (Payasam) with vermicelli/rice, cashews, raisins, and cardamom, warm and sweet.",
            price: 150,
            category: "Dessert",
            stock: 20,
            image: "/uploads/tn_coconut_milk_payasam.png"
        };

        let result;
        const existing = await Product.findOne({ name: newItem.name });
        if (!existing) {
            const created = await Product.create(newItem);
            result = { name: newItem.name, status: 'created', id: created._id };
        } else {
            result = { name: newItem.name, status: 'already_exists', id: existing._id };
        }

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json({ success: false, error: 'Seed failed' }, { status: 500 });
    }
}
