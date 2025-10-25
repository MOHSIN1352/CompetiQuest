// models/Category.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

export default mongoose.model('Category', CategorySchema);
