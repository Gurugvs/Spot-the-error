import mongoose from 'mongoose';

export let isMongoConnected = false;

export async function connectDB(): Promise<boolean> {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/spot-the-errors';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    console.log(`[MongoDB] Connected successfully to ${mongoUri}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB] Could not connect to MongoDB (${(error as Error).message}).`);
    console.log(`[Database] Operating in seamless high-performance In-Memory Hybrid Store.`);
    isMongoConnected = false;
    return false;
  }
}
