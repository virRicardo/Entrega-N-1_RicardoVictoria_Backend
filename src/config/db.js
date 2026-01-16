
import mongoose from "mongoose";
import dotenv from "dotenv";
console.log("MONGO_URL:", process.env.MONGO_URL);

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB conectado");
  } catch (error) {
    console.error("Error MongoDB", error);
  }
};

export default connectDB;
