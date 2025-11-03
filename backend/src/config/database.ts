import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('❌ MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    });
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.error('⚠️  Server will continue but database operations will fail');
    console.error('💡 Make sure your IP is whitelisted in MongoDB Atlas');
    // Don't exit - allow server to start for testing other endpoints
    // process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});