const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

async function seedSettings() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const SettingsSchema = new mongoose.Schema({
            auth: {
                chief: { type: String, default: 'admin123' },
                inventory: { type: String, default: 'admin123' },
                billing: { type: String, default: 'admin123' },
                menu: { type: String, default: 'admin123' },
                master: { type: String, default: 'admin123' },
            }
        });

        const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

        const count = await Settings.countDocuments();
        if (count === 0) {
            await Settings.create({});
            console.log('Default settings seeded successfully');
        } else {
            console.log('Settings already exist, skipping seed');
        }

        await mongoose.disconnect();
        console.log('Disconnected');
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedSettings();
