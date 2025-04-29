const bcrypt = require("bcryptjs");
const Auth = require("../models/authModel");
require("dotenv").config();

const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await Auth.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists.");
      return;
    }

    const name = process.env.DEFAULT_ADMIN_NAME || "Admin";
    const email = process.env.DEFAULT_ADMIN_EMAIL;
    const password = process.env.DEFAULT_ADMIN_PASSWORD;

    if (!email || !password) {
      console.warn(
        "Default admin credentials are missing in environment variables."
      );
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = new Auth({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    await adminUser.save();
    console.log("✅ Default admin user created successfully.");
  } catch (error) {
    console.error("❌ Failed to create default admin:", error.message);
  }
};

module.exports = createDefaultAdmin;
