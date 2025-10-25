const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./Database/Connection.js');
const cors = require('cors');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./Routes/AuthRoutes.js');
const userRoutes = require('./Routes/UserRoutes.js');
const companyRoutes = require('./Routes/CompanyRoutes.js');
const topicRoutes = require('./Routes/TopicRoutes.js');
const questionRoutes = require('./Routes/QuestionRoutes.js');
const quizRoutes = require('./Routes/QuizRoutes.js');
const categoryRoutes = require('./Routes/CategoryRoutes.js');
const categoryRoutes = require('./Routes/CategoryRoutes.js');

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/categories', categoryRoutes); // New

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 Handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
