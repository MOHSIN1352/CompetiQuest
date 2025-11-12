import mongoose from 'mongoose';

const { Schema } = mongoose;

const AttemptQuestionSchema = new Schema({
    question_id: {
        type: Schema.Types.ObjectId,
        ref: 'Question'
    },
    question_data: {
        description: String,
        options: [String],
        correct_option_index: Number
    },
    selected_option_index: {
        type: Number,
        default: null
    },
    is_correct: {
        type: Boolean,
        default: null
    }
}, { _id: false });

const QuizAttemptSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    topic: {
        type: Schema.Types.Mixed,
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
    status: {
        type: String,
        enum: ['in_progress', 'completed'],
        default: 'in_progress'
    },
    attempted_at: {
        type: Date,
        default: Date.now
    },
    completed_at: {
        type: Date
    },
    duration_seconds: {
        type: Number
    }
}, {
    timestamps: true
});

export default mongoose.model('QuizAttempt', QuizAttemptSchema);
