import mongoose from 'mongoose';

// Simple in-memory test setup without MongoDB Memory Server
export const setupTestDB = async () => {
  // Mock mongoose connection for testing
  if (mongoose.connection.readyState === 0) {
    // Create a mock connection that doesn't actually connect
    mongoose.connection.readyState = 1;
  }
};

export const closeTestDB = async () => {
  // Mock cleanup
  if (mongoose.connection.readyState !== 0) {
    mongoose.connection.readyState = 0;
  }
};

export const clearTestDB = async () => {
  // Mock clear - no actual database operations
  return Promise.resolve();
};