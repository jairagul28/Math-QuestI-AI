const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Topic = require('../models/Topic');
const { topics } = require('./seedData');

dotenv.config();

const seedTopics = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mathquest_ai';
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected to MongoDB for seeding...');

    // Clear existing topics
    await Topic.deleteMany({});
    console.log('[Seeder] Cleared old topics...');

    // Insert new curriculum topics
    const inserted = await Topic.insertMany(topics);
    console.log(`[Seeder] Successfully seeded ${inserted.length} Georgia Standards-aligned topics!`);

    await mongoose.connection.close();
    console.log('[Seeder] Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder] Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

// Auto-seed function that can be called when server starts if collection is empty
const seedIfEmpty = async () => {
  try {
    const count = await Topic.countDocuments();
    if (count === 0) {
      console.log('[Seeder] No topics found in database. Auto-seeding curriculum standards...');
      await Topic.insertMany(topics);
      console.log(`[Seeder] Auto-seeded ${topics.length} Georgia Standards-aligned topics successfully!`);
    } else {
      console.log(`[Seeder] Topics collection already contains ${count} records. Skipping auto-seed.`);
    }
  } catch (error) {
    console.error(`[Seeder] Error checking or seeding topics: ${error.message}`);
  }
};

if (require.main === module) {
  seedTopics();
}

module.exports = { seedIfEmpty, seedTopics };

