import mongoose from "mongoose";

const uri = "mongodb+srv://robin3dlogic_db_user:robinkhan9090@mannubhai.tkrzttu.mongodb.net/test?retryWrites=true&w=majority&appName=mannuBhai";

async function testConnection() {
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB Connected Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection Failed:", error);
    process.exit(1);
  }
}

testConnection();
