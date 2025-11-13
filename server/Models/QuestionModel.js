import mongoose from 'mongoose';

const { Schema } = mongoose;

const QuestionSchema = new Schema({
    questionText: {
        type: String,
        required: true,
        trim: true,
        unique: true // keep to avoid duplicate scraped questions; remove if too restrictive
    },
    options: {
        type: [String],
        required: true,
        validate: {
            validator: function (arr) {
                // at least 2 options, at most 6
                return Array.isArray(arr) && arr.length >= 2 && arr.length <= 6;
            },
            message: 'Options must be an array with 2 to 6 items.'
        }
    },
    correctOptionIndex: {
        type: Number,
        required: true,
        validate: {
            validator: function (value) {
                // During updates, this.options might not be available yet
                // So we'll do a basic validation here and rely on controller validation
                return Number.isInteger(value) && value >= 0;
            },
            message: 'correctOptionIndex must be a non-negative integer.'
        }
    },
    topic: {
        type: Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    explanation: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});



export default mongoose.model('Question', QuestionSchema);
