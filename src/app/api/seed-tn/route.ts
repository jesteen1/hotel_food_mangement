
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Product } from '@/lib/models';

export async function GET() {
    try {
        await connectToDatabase();

        const newItems = [
            {
                name: "Paal Appam",
                description: "Authentic Tamil Nadu Paal Appam with thick coconut milk poured over the soft center, crispy lace edges, golden brown, served on a green banana leaf.",
                price: 120,
                category: "Deep South Special",
                stock: 20,
                image: "/uploads/tn_paal_appam.png"
            },
            {
                name: "Idli Sambar",
                description: "Soft fluffy white Idli served with coconut chutney and hot sambar in small bowls, authentic south indian breakfast.",
                price: 80,
                category: "Breakfast",
                stock: 30,
                image: "/uploads/tn_idli_sambar.png"
            },
            {
                name: "Chettinad Chicken",
                description: "Spicy Chettinad Chicken curry in a traditional clay pot, rich red gravy, garnished with curry leaves.",
                price: 350,
                category: "Main Course",
                stock: 15,
                image: "/uploads/tn_chettinad_chicken.png"
            }
        ];

        const results = [];

        for (const item of newItems) {
            const existing = await Product.findOne({ name: item.name });
            if (!existing) {
                const created = await Product.create(item);
                results.push({ name: item.name, status: 'created', id: created._id });
            } else {
                results.push({ name: item.name, status: 'already_exists', id: existing._id });
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json({ success: false, error: 'Seed failed' }, { status: 500 });
    }
}
