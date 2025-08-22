import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Mongoose connection setup
const mongDbConnection = async () => {
  try {
    let conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
export default mongDbConnection;