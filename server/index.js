const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./Database/Connection.js');
const cors = require('cors');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());


const authRoutes = require('./Routes/AuthRoutes.js');
const userRoutes = require('./Routes/UserRoutes.js');
const companyRoutes = require('./Routes/CompanyRoutes.js');
const topicRoutes = require('./Routes/TopicRoutes.js');
const questionRoutes = require('./Routes/QuestionRoutes.js');
const quizRoutes = require('./Routes/QuizRoutes.js');


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quiz', quizRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler (no path) — avoid using '*' which can cause path-to-regexp errors
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
