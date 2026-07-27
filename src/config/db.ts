import mongoose from 'mongoose';

export const connectDb = async () => {
    try {
        if(!process.env.MONGO_URL) {
           return console.log(`MongoDB connection failed: ${process.env.MONGO_URL} `);
        }
        const connet = await mongoose.connect(process.env.MONGO_URL)
        console.log(`✅ MongoDB connected: ${connet.connection.host}`);
    } catch (error) {
        console.log(error)
    }
}