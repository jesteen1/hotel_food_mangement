
const mongoose = require('mongoose');

const uri = 'mongodb://127.0.0.1:27017/hotelapp';

console.log('Attempting to connect to:', uri);

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('SUCCESS: Connected to MongoDB');
        process.exit(0);
    })
    .catch((err) => {
        console.error('FAILURE: Could not connect to MongoDB');
        console.error(err.message);
        process.exit(1);
    });
