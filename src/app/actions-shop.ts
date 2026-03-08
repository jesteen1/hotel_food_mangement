'use server';

import connectToDatabase from '@/lib/db';
import { User } from '@/lib/models';

export async function listHotels() {
    try {
        await connectToDatabase();
        const users = await User.find({}, 'companyName email').lean();
        return JSON.parse(JSON.stringify(users));
    } catch (error) {
        console.error("List Hotels Error:", error);
        return [];
    }
}
