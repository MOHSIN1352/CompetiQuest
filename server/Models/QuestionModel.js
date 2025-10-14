const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    question_text: {
        type: String,
        required: true,
        unique: true, // Prevent duplicate scraped questions
        trim: true
    },
    options: {
        type: [String],
        required: true,
        validate: {
            validator: function (arr) {
                return arr.length >= 2; // Minimum 2 options required
            },
            message: 'At least two options are required.'
        }
    },
    correct_option_index: {
        type: Number,
        required: true,
        validate: {
            validator: function (value) {
                return value >= 0 && value < this.options.length;
            },
            message: 'Correct option index must be within options range.'
        }
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    subjects: [{
        type: String,
        required: true
    }],
    // companies: [{
    //     type: String,
    //     required: true
    // }],
    companies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('Question', QuestionSchema);