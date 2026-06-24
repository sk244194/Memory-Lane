import mongoose, { Schema, Model } from 'mongoose';
import { connectToUserDatabase } from '@/lib/db';

export interface IUser {
    email: string;
    password: string;
    createdAt: Date;
}

export const UserSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export async function getUserModel(): Promise<Model<IUser>> {
    const connection = await connectToUserDatabase();
    // Return existing compiled model on this connection if available, otherwise compile it
    return connection.models.User || connection.model<IUser>('User', UserSchema);
}
