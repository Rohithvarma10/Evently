// scripts/buildEventIndexes.js
require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');

(async () => {
  try {
    console.log('CWD:', process.cwd());
    console.log('__dirname:', __dirname);

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not set in .env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to Mongo');

    // Load Event model
    const eventModelPath = path.join(__dirname, '..', 'models', 'event');
    console.log('Requiring model from:', eventModelPath);
    const Event = require(eventModelPath);

    // Create indexes
    await Event.collection.createIndex({ title: 1 });
    await Event.collection.createIndex({ location: 1 });
    await Event.collection.createIndex({ location: 1, date: -1 });

    console.log('✅ Event indexes created.');
    const idx = await Event.collection.indexes();
    console.table(idx);

    await mongoose.disconnect();
    console.log('✅ Done.');
  } catch (e) {
    console.error('❌ Error creating indexes:', e);
    process.exit(1);
  }
})();

