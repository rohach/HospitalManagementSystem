const mongoose = require("mongoose");

const connectDB = async (MONGO_URI) => {
  try {
    const DB_OPTIONS = {
      dbName: "HMS",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    await mongoose.connect(MONGO_URI, DB_OPTIONS);
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Failed to connect to the database!");
    console.error(error); // logs the actual error
    process.exit(1); // exit the app if DB connection fails
  }
};

module.exports = connectDB;
