// models/Question.js
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
                // use normal function to access 'this'
                return Number.isInteger(value) && Array.isArray(this.options) && value >= 0 && value < this.options.length;
            },
            message: 'correctOptionIndex must be a valid index in options array.'
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
