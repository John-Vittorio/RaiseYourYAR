import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        // Close any existing connections first
        if (mongoose.connection.readyState !== 0) {
            console.log('Closing existing MongoDB connection...')
            await mongoose.connection.close()
        }
        
        // Force using the updated environment variable
        const mongoURI = process.env.MONGO_URI
        console.log(`Connecting to MongoDB: ${mongoURI.substring(0, mongoURI.indexOf('@') + 1)}[CREDENTIALS_HIDDEN]`)
        
        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`)
        return conn
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); 
        /* 
        Code 1 ~ Exit W/ Failure
        Code 0 ~ Success
        */
    }
}