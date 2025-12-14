
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../src/lib/models';

dotenv.config({ path: '.env.local' });

async function testWrite() {
    console.log("1. Connecting to DB...");
    if (!process.env.MONGODB_URI) {
        console.error("❌ MONGODB_URI is missing from env");
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        const email = "joseharrywillam230@gmail.com";
        const companyName = "Jose Verify Corp";

        console.log(`2. Attempting to create user: ${email}`);

        // Cleanup first just in case
        await User.deleteOne({ email });

        const newUser = await User.create({
            email,
            companyName
        });

        console.log("3. Create() call returned:", newUser);

        // Verify read
        const verifyUser = await User.findOne({ email });
        console.log("4. FindOne() verification:", verifyUser);

        if (verifyUser) {
            console.log("SUCCESS: User was written and read back.");
        } else {
            console.error("FAILURE: User was created but could not be found!");
        }

    } catch (error) {
        console.error("❌ Error during test:", error);
    } finally {
        await mongoose.disconnect();
        console.log("5. Disconnected");
    }
}

testWrite();
