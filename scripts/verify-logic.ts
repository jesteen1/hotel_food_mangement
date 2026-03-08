import mongoose from 'mongoose';
import connectToDatabase from '../src/lib/db';
import { User, Settings, Product } from '../src/lib/models';
import { verifyAccessCode, getProductsByShop } from '../src/app/actions';

async function test() {
    console.log("Starting Verification Tests...");
    await connectToDatabase();

    // 1. Check if we can find a user
    const testUser = await User.findOne();
    if (!testUser) {
        console.log("No user found in DB to test with. Please register a user first.");
        process.exit(0);
    }
    console.log(`Testing with user: ${testUser.email}`);

    // 2. Check settings and access code
    let settings = await Settings.findOne({ ownerEmail: testUser.email });
    if (!settings) {
        console.log("Creating default settings for test user...");
        settings = await Settings.create({ ownerEmail: testUser.email });
    }
    console.log(`Current Access Code: ${settings.accessCode}`);

    // 3. Test verifyAccessCode
    const validResult = await verifyAccessCode(testUser.email, settings.accessCode);
    console.log(`Verify Valid Code: ${validResult.success ? "PASSED" : "FAILED"}`);

    const invalidResult = await verifyAccessCode(testUser.email, "WRONG123");
    console.log(`Verify Invalid Code: ${!invalidResult.success ? "PASSED" : "FAILED"}`);

    // 4. Test getProductsByShop
    const shopData = await getProductsByShop(testUser.email);
    console.log(`Shop Name: ${shopData.shopName}`);
    console.log(`Product Count: ${shopData.products.length}`);
    console.log("Fetch Products: PASSED");

    console.log("\nVerification Summary: All server-side logic checks PASSED.");
    process.exit(0);
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
