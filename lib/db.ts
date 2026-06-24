import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_USERS_URI = process.env.MONGODB_USERS_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!MONGODB_USERS_URI) {
    throw new Error('Please define the MONGODB_USERS_URI environment variable inside .env.local');
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

interface UserConnectionCache {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
}

declare global {
    var mongoose: MongooseCache;
    var userMongoose: UserConnectionCache;
}

let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

let userCached = global.userMongoose;
if (!userCached) {
    userCached = global.userMongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            return mongoose;
        });
    }
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export async function connectToUserDatabase(): Promise<mongoose.Connection> {
    if (userCached.conn) {
        return userCached.conn;
    }

    if (!userCached.promise) {
        userCached.promise = Promise.resolve(mongoose.createConnection(MONGODB_USERS_URI!));
    }
    try {
        userCached.conn = await userCached.promise;
    } catch (e) {
        userCached.promise = null;
        throw e;
    }

    return userCached.conn;
}

export default connectToDatabase;
