require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("Database Error:", err);
    process.exit(1);
  }
};

async function createAdmin() {
  await connectDB();

  // Get email and password from command line arguments
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.log("Usage: node createAdmin.js <email> <password>");
    console.log("Example: node createAdmin.js admin@mietjammu.in admin123");
    process.exit(1);
  }

  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log("❌ Admin with this email already exists!");
      process.exit(1);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await Admin.create({
      email: email,
      password: hashedPassword
    });

    console.log("✅ Admin user created successfully!");
    console.log("Email:", admin.email);
    console.log("ID:", admin._id);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
    process.exit(1);
  }
}

createAdmin();

