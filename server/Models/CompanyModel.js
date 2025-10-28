import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: String,
    website: String,
    created_at: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Company', CompanySchema);
