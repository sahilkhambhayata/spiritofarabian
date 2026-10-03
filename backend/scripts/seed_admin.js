require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/user");

async function seedAdmin() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://drashtidudhat20:Drashti123@cluster0.db8y7vg.mongodb.net/spirit_of_arabian?retryWrites=true&w=majority&appName=Cluster0";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for admin seeding...");

    const email = "admin@spiritofarabian.com";
    let admin = await User.findOne({ email });

    if (!admin) {
      admin = await User.create({
        name: "Atelier Master Admin",
        email,
        password: "Admin@spirit2026",
        role: "superadmin",
        isActive: true,
      });
      console.log("Superadmin user created successfully: admin@spiritofarabian.com / Admin@spirit2026");
    } else {
      admin.role = "superadmin";
      admin.isActive = true;
      admin.password = "Admin@spirit2026";
      await admin.save();
      console.log("Superadmin user updated: admin@spiritofarabian.com / Admin@spirit2026");
    }

    mongoose.disconnect();
  } catch (err) {
    console.error("Admin seed error:", err);
    process.exit(1);
  }
}

seedAdmin();
