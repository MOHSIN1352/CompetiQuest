import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// Create test user
const testUser = {
    _id: new mongoose.Types.ObjectId(),
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword'
};

console.log('Use this userId in your API calls:');
console.log(testUser._id.toString());

mongoose.disconnect();