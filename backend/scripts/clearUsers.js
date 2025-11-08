/**
 * Clear all users from the database
 * Usage: node scripts/clearUsers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function clearUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Count users before deletion
    const countBefore = await usersCollection.countDocuments();
    console.log(`📊 Found ${countBefore} users in database`);

    if (countBefore === 0) {
      console.log('ℹ️  No users to delete');
      await mongoose.connection.close();
      return;
    }

    // Delete all users
    const result = await usersCollection.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} users`);

    // Verify deletion
    const countAfter = await usersCollection.countDocuments();
    console.log(`✅ Users remaining: ${countAfter}`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearUsers();
