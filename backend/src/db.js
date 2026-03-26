// src/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
<<<<<<< HEAD
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
=======
      useNewUrlParser: true,
      useUnifiedTopology: true,
>>>>>>> f16063f597c3b08d1cc9737ec7d0908b59fd4acb
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

<<<<<<< HEAD
export default connectDB;
=======
export default connectDB;
>>>>>>> f16063f597c3b08d1cc9737ec7d0908b59fd4acb
