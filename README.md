# CompetiQuest - Online Learning Platform

## Overview

CompetiQuest is a comprehensive online quiz platform designed for students and professionals to practice and assess their knowledge across multiple subjects. The platform provides practice questions from curated question banks and generates AI-powered quizzes using the Gemini API for personalized learning experiences.

## Core Features

- User authentication with role-based access control (Admin and User)
- Practice questions organized by category and difficulty level
- AI-generated quizzes powered by Gemini API
- Real-time scoring and immediate feedback
- Progress tracking and learning analytics
- Administrative dashboard for content management
- Responsive design for desktop and mobile devices
- RESTful API architecture with JWT authentication

## Technology Stack

### Backend
- Node.js and Express.js for API server
- MongoDB for data persistence
- Mongoose for object modeling
- JWT for authentication
- bcrypt for secure password hashing
- Gemini API for AI-generated quizzes

### Frontend
- Next.js 15+ with Turbopack
- React for component-based UI
- Tailwind CSS for styling
- Axios for API communication

### Testing and Development
- Jest for unit and integration testing
- Supertest for HTTP testing
- ESLint and Prettier for code quality

## Project Structure

```
CompetiQuest/
├── client/                          # Next.js frontend application
│   └── CompetiQuest-frontend_integration/
│       ├── app/                     # Page components (Next.js 13+ app router)
│       │   ├── admin/               # Admin dashboard
│       │   ├── auth/                # Login and registration pages
│       │   ├── dashboard/           # User dashboard
│       │   ├── profile/             # User profile management
│       │   ├── quiz/                # Quiz interface
│       │   └── [category]/...       # Dynamic category navigation
│       ├── components/              # Reusable React components
│       │   ├── auth/                # Authentication components
│       │   ├── home/                # Homepage components
│       │   ├── qna/                 # Question display components
│       │   └── ui/                  # Generic UI components
│       ├── lib/                     # Utility functions
│       ├── public/                  # Static assets
│       └── styles/                  # Global stylesheets
├── server/                          # Node.js backend API
│   ├── Controllers/                 # Business logic handlers
│   │   ├── AdminControllers.js      # Admin operations
│   │   ├── CategoryControllers.js   # Category management
│   │   ├── QuestionControllers.js   # Practice question operations
│   │   ├── QuizControllers.js       # Quiz generation and scoring
│   │   ├── TopicControllers.js      # Topic management
│   │   └── UserControllers.js       # User authentication
│   ├── Database/                    # MongoDB connection
│   ├── Middleware/                  # Authentication middleware
│   ├── Models/                      # Mongoose schemas
│   └── Routes/                      # API endpoints
├── __tests__/                       # Test suites
│   ├── Controllers/                 # Unit tests
│   └── integration/                 # Integration tests
├── documentations/                  # Project documentation and PDFs
└── jest.config.js                   # Testing configuration
```

## Folder Structure Details

### Frontend (`client/`)
Next.js application with modern React components. Key features:
- Authentication pages (login, register)
- Admin dashboard for content management
- User dashboard with progress tracking
- Quiz interface for answering questions
- Profile management

### Backend (`server/`)
Express.js API server with the following structure:
- **Controllers**: Core business logic for authentication, practice questions, AI-generated quizzes, and user management
- **Models**: MongoDB schemas for users, categories, topics, questions, and quiz attempts
- **Routes**: RESTful API endpoints
- **Middleware**: JWT authentication and authorization
- **Database**: MongoDB connection configuration

### Testing (`__tests__/`)
Comprehensive test coverage with unit and integration tests. Includes:
- Controller unit tests with mocked database operations
- Integration tests for complete workflows
- Authentication, question management, and quiz functionality testing

## Key Features Implementation

### Practice Questions
- Curated question banks organized by subject and topic
- Difficulty levels (basic, intermediate, advanced)
- Immediate feedback on answers
- Performance tracking by category

### AI-Generated Quizzes
- Dynamic quiz generation using Gemini API
- Natural language question generation
- Adaptive difficulty based on performance
- Personalized learning paths

### User Management
- Secure JWT-based authentication
- Role-based access control (Admin and Regular User)
- User progress tracking
- Performance analytics and insights

### Admin Features
- Content management for categories and topics
- Practice question CRUD operations
- User management and monitoring
- Dashboard with learning statistics

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud service)
- Gemini API key

### Installation

1. Clone the repository:
```
git clone https://github.com/AAruhsi/CompetiQuest.git
cd CompetiQuest
```

2. Backend setup:
```
cd server
npm install
cp .env.example .env
npm run dev
```

3. Frontend setup:
```
cd client/CompetiQuest-frontend_integration
npm install
npm run dev
```

### Environment Variables

Backend (.env):
- MONGODB_URI: MongoDB connection string
- JWT_SECRET: Secret key for token generation
- GEMINI_API_KEY: API key for Gemini AI service
- PORT: Server port (default: 5000)

Frontend (.env.local):
- NEXT_PUBLIC_API_URL: Backend API URL

## Testing

Run the complete test suite:
```
npm test
```

Run specific test categories:
```
npm run test:controllers
npm run test:integration
```

Generate coverage report:
```
npm run test:coverage
```

## API Documentation

Comprehensive API endpoint documentation is available in `server/Api-Endpoints.md`. Key endpoints include:
- Authentication: `/api/auth/login`, `/api/auth/register`
- Practice Questions: `/api/questions`
- AI Quiz Generation: `/api/quiz/generate`
- User Management: `/api/users/profile`

## Future Enhancements

Potential features to extend the platform:
- Performance analytics dashboard with detailed reports
- Leaderboard and competitive features
- Question tagging and advanced search
- Mobile application support
- Real-time collaboration features
- Spaced repetition algorithm for study optimization
- Integration with learning management systems

## Contributing

Contributions are welcome. Please follow these guidelines:
- Write clean, readable code with proper documentation
- Add tests for new features
- Follow the existing project structure
- Create descriptive pull requests with clear commit messages

## Support

For issues, bug reports, or feature requests, please open an issue on the GitHub repository.

## License

This project is developed as part of a Service-Oriented Architecture course project for educational purposes.
