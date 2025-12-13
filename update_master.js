const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

async function updateMasterPassword() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const Settings = mongoose.models.Settings || mongoose.model('Settings', new mongoose.Schema({
            auth: {
                chief: String,
                inventory: String,
                billing: String,
                menu: String,
                master: String,
            }
        }));

        const settings = await Settings.findOne();
        if (settings) {
            settings.auth.master = 'peterparker';
            await settings.save();
            console.log('Master password updated to "peterparker"');
        } else {
            console.log('Settings not found');
        }

        await mongoose.disconnect();
        console.log('Disconnected');
    } catch (error) {
        console.error('Update failed:', error);
        process.exit(1);
    }
}

updateMasterPassword();
