import mongoose from 'mongoose';

const { Schema } = mongoose;

const TopicSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subjects: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

// Ensure topic names are unique within a category
TopicSchema.index({ name: 1, category: 1 }, { unique: true });

export default mongoose.model('Topic', TopicSchema);
