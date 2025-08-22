import mongoose from "mongoose";
import mongDbConnection from "../db.js";

const databaseMiddleware = async (req, res, next) => {
  if (mongoose.connection.readyState === 0) {
    // 0 = disconnected
    await mongDbConnection();
  }
  next(); // Proceed to the next middleware or route handler
};
export default databaseMiddleware;
