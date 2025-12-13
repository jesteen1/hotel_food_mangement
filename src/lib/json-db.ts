
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data.json');

interface Data {
    products: any[];
    orders: any[];
}

async function getDb(): Promise<Data> {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // Return default data if file doesn't exist
        return {
            products: [],
            orders: [],
        };
    }
}

async function saveDb(data: Data) {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

export async function getProductsLocal() {
    const db = await getDb();
    if (db.products.length === 0) {
        // Seed if empty
        db.products = [
            { _id: 'local_1', name: 'Burger', price: 150, category: 'Main', stock: 50, description: 'Juicy chicken burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd' },
            { _id: 'local_2', name: 'Fries', price: 80, category: 'Sides', stock: 100, description: 'Crispy salted fries', image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d' },
            { _id: 'local_3', name: 'Coke', price: 50, category: 'Drinks', stock: 200, description: 'Chilled cola', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97' },
        ];
        await saveDb(db);
    }
    return db.products;
}

export async function createProductLocal(product: any) {
    const db = await getDb();
    const newProduct = { ...product, _id: 'local_p_' + Date.now() };
    db.products.push(newProduct);
    await saveDb(db);
    return newProduct;
}

export async function updateProductStockLocal(id: string, stock: number) {
    const db = await getDb();
    const product = db.products.find(p => p._id === id);
    if (product) {
        product.stock = stock;
        await saveDb(db);
    }
}

export async function updateProductLocal(id: string, data: any) {
    const db = await getDb();
    const index = db.products.findIndex(p => p._id === id);
    if (index !== -1) {
        db.products[index] = { ...db.products[index], ...data };
        await saveDb(db);
    }
}

export async function deleteProductLocal(id: string) {
    const db = await getDb();
    db.products = db.products.filter(p => p._id !== id);
    await saveDb(db);
}

export async function createOrderLocal(orderData: any) {
    const db = await getDb();

    // Deduct stock
    for (const item of orderData.items) {
        const product = db.products.find(p => p._id === item.product); // item.product in order, item.productId in input
        if (product) {
            product.stock -= item.quantity;
        }
    }

    const newOrder = {
        ...orderData,
        _id: 'local_o_' + Date.now(),
        createdAt: new Date().toISOString()
    };
    db.orders.push(newOrder);
    await saveDb(db);
    return newOrder;
}

export async function getOrdersLocal() {
    const db = await getDb();
    return db.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateOrderStatusLocal(id: string, status: string) {
    const db = await getDb();
    const order = db.orders.find(o => o._id === id);
    if (order) {
        order.status = status;
        await saveDb(db);
    }
}
