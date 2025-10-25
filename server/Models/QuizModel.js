// models/QuizAttempt.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const AttemptQuestionSchema = new Schema({
    questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    selectedOptionIndex: {
        type: Number,
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    }
}, { _id: false });

const QuizAttemptSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    topic: {
        type: Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    },
    questions: {
        type: [AttemptQuestionSchema],
        default: []
    },
    score: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    attemptedAt: {
        type: Date,
        default: Date.now
    },
    // optional: duration/timeTaken in seconds (useful later)
    durationSeconds: {
        type: Number
    }
}, {
    timestamps: true
});

export default mongoose.model('QuizAttempt', QuizAttemptSchema);
