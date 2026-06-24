import mongoose, { Schema, Model } from 'mongoose';

export interface IEntry {
    email: string;
    content: string;
    mood: string;
    createdAt: Date;
    embedding: number[];
}

const EntrySchema = new Schema<IEntry>({
    email: { type: String, required: true, index: true },
    content: { type: String, required: true },
    mood: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    embedding: { type: [Number], default: [] }, // Vector index must be created in MongoDB Atlas
});

// Prevent recompilation of model in development
const Entry: Model<IEntry> = mongoose.models.Entry || mongoose.model<IEntry>('Entry', EntrySchema);

export default Entry;
