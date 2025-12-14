
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Product } from '@/lib/models';

export async function GET() {
    try {
        await connectToDatabase();

        const newItems = [
            // 1-6 (With Images)
            { name: "Ambur Chicken Biryani", description: "Aromatic seeraga samba rice biryani from Ambur.", price: 220, category: "Main Course", stock: 30, image: "/uploads/tn_ambur_biryani.png" },
            { name: "Mutton Biryani", description: "Rich and spicy mutton biryani.", price: 320, category: "Main Course", stock: 20, image: "/uploads/tn_mutton_biryani.png" },
            { name: "Veg Biryani", description: "Assorted vegetables cooked with aromatic spices.", price: 180, category: "Main Course", stock: 25, image: "/uploads/tn_veg_biryani.png" },
            { name: "Curd Rice", description: "Soothing yogurt rice with pomegranate and tempering.", price: 80, category: "Main Course", stock: 30, image: "/uploads/tn_curd_rice.png" },
            { name: "Lemon Rice", description: "Tangy lemon flavored rice with peanuts.", price: 80, category: "Main Course", stock: 25, image: "/uploads/tn_lemon_rice.png" },
            { name: "Parotta", description: "Flaky layered flatbread (2 pcs) with salna.", price: 60, category: "Main Course", stock: 50, image: "/uploads/tn_parotta_salna.png" },

            // 7-20 (No Images due to quota)
            { name: "Butter Naan", description: "Soft tandoor-baked flatbread with butter.", price: 50, category: "Main Course", stock: 50, image: "" },
            { name: "Paneer Butter Masala", description: "Soft paneer cubes in rich tomato gravy.", price: 200, category: "Main Course", stock: 30, image: "" },
            { name: "Chicken Chettinad Gravy", description: "Spicy chicken curry with roasted spices.", price: 240, category: "Main Course", stock: 25, image: "" },

            { name: "Chicken 65", description: "Spicy deep-fried chicken chunks with curry leaves.", price: 180, category: "Starters", stock: 40, image: "" },
            { name: "Gobi Manchurian", description: "Crispy cauliflower tossed in tangy sauce.", price: 140, category: "Starters", stock: 30, image: "" },
            { name: "Chilli Paneer", description: "Paneer cubes tossed with peppers and chillies.", price: 160, category: "Starters", stock: 30, image: "" },
            { name: "Fish Fry", description: "Vanjaram fish slice marinated and shallow fried.", price: 250, category: "Starters", stock: 20, image: "" },
            { name: "Prawn Sukka", description: "Dry roasted spicy prawns with coconut slices.", price: 280, category: "Starters", stock: 20, image: "" },

            { name: "Filter Coffee", description: "Authentic South Indian filter coffee in steel tumbler.", price: 40, category: "Beverages", stock: 100, image: "" },
            { name: "Masala Tea", description: "Spiced tea with cardamom and ginger.", price: 30, category: "Beverages", stock: 100, image: "" },
            { name: "Fresh Lime Soda", description: "Refreshing lime soda, sweet or salt.", price: 60, category: "Beverages", stock: 50, image: "" },
            { name: "Rose Milk", description: "Chilled milk with rose syrup and basil seeds.", price: 70, category: "Beverages", stock: 40, image: "" },
            { name: "Gulab Jamun", description: "Deep-fried milk solids soaked in sugar syrup (2 pcs).", price: 60, category: "Dessert", stock: 50, image: "" },
            { name: "Brownie with Ice Cream", description: "Warm walnut brownie topped with vanilla scoop.", price: 140, category: "Dessert", stock: 30, image: "" }
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
