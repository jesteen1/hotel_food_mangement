
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Product } from '@/lib/models';

export async function GET() {
    try {
        await connectToDatabase();

        const newItems = [
            // Desserts
            {
                name: "Madurai Jigarthanda",
                description: "Famous cooling drink with almond gum, sarsaparilla syrup, and ice cream.",
                price: 180,
                category: "Dessert",
                stock: 20,
                image: "/uploads/tn_madurai_jigarthanda.png"
            },
            {
                name: "Tender Coconut Ice Cream",
                description: "Natural tender coconut flavor, creamy and rich.",
                price: 120,
                category: "Dessert",
                stock: 20,
                image: "/uploads/tn_tender_coconut_ice_cream.png"
            },
            {
                name: "Mango Kulfi",
                description: "Traditional indian ice cream with alphonso mango slices.",
                price: 100,
                category: "Dessert",
                stock: 20,
                image: "/uploads/tn_mango_kulfi.png"
            },
            // TN Varieties
            {
                name: "Masala Dosa",
                description: "Crispy crepe filled with potato masala, served with chutney/sambar.",
                price: 90,
                category: "Breakfast",
                stock: 30,
                image: "/uploads/tn_masala_dosa.png"
            },
            {
                name: "Ghee Roast Dosa",
                description: "Thin crispy dosa drizzled with pure ghee, cone shaped.",
                price: 110,
                category: "Breakfast",
                stock: 30,
                image: "/uploads/tn_ghee_roast_dosa.png"
            },
            {
                name: "Rava Dosa",
                description: "Semolina based crispy lace dosa with cumin and peppercorns.",
                price: 100,
                category: "Breakfast",
                stock: 25,
                image: "/uploads/tn_rava_dosa.png"
            },
            {
                name: "Onion Uttapam",
                description: "Thick pancake topped with sauteed onions and green chillies.",
                price: 95,
                category: "Breakfast",
                stock: 25,
                image: "/uploads/tn_onion_uttapam.png"
            },
            {
                name: "Ven Pongal",
                description: "Comforting rice and lentil dish tempered with ghee, pepper, and cashews.",
                price: 80,
                category: "Breakfast",
                stock: 20,
                image: "/uploads/tn_ven_pongal.png"
            },
            {
                name: "Medhu Vada",
                description: "Crispy lentil donuts, fluffy inside.",
                price: 40,
                category: "Starters",
                stock: 50,
                image: "/uploads/tn_medhu_vada.png"
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
