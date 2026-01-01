import xlsx from "xlsx";
import mongoose from "mongoose";
import User from "../src/models/User.js";

/* ================= DB CONFIG ================= */
const MONGODB_URI =
  "mongodb+srv://robin3dlogic_db_user:Robin433400@mannubhai.tkrzttu.mongodb.net/test?retryWrites=true&w=majority&appName=mannuBhai";

/* ================= DB CONNECT ================= */
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
  console.log("✅ MongoDB Connected");
}

/* ================= BULK REGISTER ================= */
async function bulkRegister() {
  await connectDB();

  const workbook = xlsx.readFile("public/importing-db.csv");
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  console.log("📄 Total rows found:", rows.length);
  console.log("🧪 Sample row:", rows[0]);

  let inserted = 0;
  let skipped = 0;
  let index = 0;

  for (const row of rows) {
    index++;
    console.log(`\n➡️ Processing row ${index}`);

    const fullName =
      row["full name"] ||
      row["full_name"] ||
      row["name"] ||
      "";

    const email = row["email"]?.toLowerCase()?.trim();

    let phone =
      row["phone_number"] ||
      row["phone"] ||
      row["mobile"] ||
      row["Mobile Number"];

    console.log("   👉 Raw Phone:", phone);

    let remarks = "";

    if (phone !== undefined && phone !== null) {
      const rawPhone = phone;

      // ✅ FIX: convert to string FIRST
      phone = String(phone).replace(/\D/g, "");

      // handle 0091
      if (phone.startsWith("0091")) {
        remarks = `Country code 0091 removed from phone: ${rawPhone}`;
        phone = phone.slice(4);
      }

      // handle 91
      if (phone.length === 12 && phone.startsWith("91")) {
        remarks = `Country code 91 removed from phone: ${rawPhone}`;
        phone = phone.slice(2);
      }

      console.log("   👉 Clean Phone:", phone);
    }

    // final validation
    if (!phone || phone.length !== 10 || !email) {
      console.log("   ❌ SKIPPED: Invalid phone/email");
      skipped++;
      continue;
    }

    // duplicate check
    const exists = await User.findOne({
      $or: [{ phone }, { email }],
    });

    if (exists) {
      console.log("   ❌ SKIPPED: User already exists");
      skipped++;
      continue;
    }

    await User.create({
      userId: `USR${Date.now()}${Math.floor(Math.random() * 1000)}`,
      fullName,
      email,
      phone,
      wallet: 500,
      freeUsedCount: 2,
      subscription: {
        status: "inactive",
        plan: "Free",
      },
      source: "bulk-upload",
      remarks,
    });

    console.log("   ✅ INSERTED");
    inserted++;
  }

  console.log("\n================ FINAL RESULT ================");
  console.log("✅ Inserted:", inserted);
  console.log("⚠️ Skipped:", skipped);

  process.exit(0);
}

/* ================= RUN ================= */
bulkRegister();
