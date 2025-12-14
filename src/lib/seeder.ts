import { Product } from "./models";

export const TEMPLATE_PRODUCTS = [
    {
        name: "Classic Burger",
        category: "Food",
        price: 150,
        stock: 50,
        description: "Juicy beef patty with fresh lettuce and cheese.",
        image: "/images/burger.png"
    },
    {
        name: "Margherita Pizza",
        category: "Food",
        price: 300,
        stock: 20,
        description: "Classic tomato and mozzarella pizza with basil.",
        image: "/images/pizza.png"
    },
    {
        name: "Coca Cola",
        category: "Beverage",
        price: 40,
        stock: 100,
        description: "Chilled soft drink with ice.",
        image: "/images/coke.png"
    },
    {
        name: "French Fries",
        category: "Sides",
        price: 80,
        stock: 40,
        description: "Crispy golden salted fries.",
        image: "/images/french_fries_crispy.png"
    },
    {
        name: "Chocolate Brownie",
        category: "Dessert",
        price: 120,
        stock: 15,
        description: "Rich chocolate fudge brownie with ice cream.",
        image: "/images/brownie.png"
    }
];

export async function seedDefaultProducts(ownerEmail: string) {
    try {
        // Check if user already has products
        const existingProducts = await Product.find({ ownerEmail });

        if (existingProducts.length === 0) {
            console.log(`[Seeder] Seeding default products for ${ownerEmail}...`);
            const products = TEMPLATE_PRODUCTS.map(p => ({
                ...p,
                ownerEmail
            }));

            await Product.insertMany(products);
            console.log(`[Seeder] Successfully added ${products.length} products.`);
        } else {
            // Repair Mode: Check if existing template products have old images
            console.log(`[Seeder] Check for image updates for ${ownerEmail}...`);
            let updates = 0;

            for (const template of TEMPLATE_PRODUCTS) {
                const match = existingProducts.find(p => p.name === template.name);
                if (match && match.image !== template.image) {
                    // Force update for French Fries to ensure the new local image is applied
                    // Or if it matches heuristic
                    if (template.name === 'French Fries' || match.image?.includes('unsplash') || !match.image) {
                        console.log(`[Seeder] updating image for ${match.name} to ${template.image}`);
                        match.image = template.image;
                        await match.save();
                        updates++;
                    }
                }
            }
            if (updates > 0) {
                console.log(`[Seeder] Updated ${updates} product images to local assets.`);
            }
        }
    } catch (error) {
        console.error("[Seeder] Failed to seed products:", error);
    }
}
