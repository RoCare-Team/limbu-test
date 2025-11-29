import { NextResponse } from "next/server";
import mongoose from "mongoose";

// -------------------- MongoDB Connection --------------------
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  isConnected = true;
  console.log("✅ MongoDB connected for Admin Business Storage");
}

// -------------------- Schema --------------------
const AdminBusinessSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, unique: true },
  listings: { type: Array, required: true },
  timestamp: { type: Date, default: Date.now },
});

const AdminBusiness =
  mongoose.models.AdminBusiness ||
  mongoose.model("AdminBusiness", AdminBusinessSchema);

// -------------------- POST API --------------------
export async function POST(req) {
  try {
    await connectDB();
    const { userEmail, listings, timestamp } = await req.json();

    if (!userEmail || !listings) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🔍 Check if a record for this email already exists
    const existingBusiness = await AdminBusiness.findOne({ userEmail });

    if (existingBusiness) {
      // ✅ Update the existing entry (overwrite or merge)
      existingBusiness.listings = listings;
      existingBusiness.timestamp = timestamp || new Date();
      await existingBusiness.save();

      return NextResponse.json({
        success: true,
        message: "Existing user's listings updated successfully",
      });
    } else {
      // 🆕 Create a new entry
      const newBusiness = new AdminBusiness({
        userEmail,
        listings,
        timestamp,
      });
      await newBusiness.save();

      return NextResponse.json({
        success: true,
        message: "New business listings saved successfully",
      });
    }
  } catch (error) {
    console.error("❌ Error saving business:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// -------------------- GET API (Admin Dashboard) --------------------
export async function GET(req) {
  try {
    await connectDB();

    // 🔥 Query Params se email read karo
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required!" },
        { status: 400 }
      );
    }

    // 🔥 Database me sirf isi email ka business find karo
    const businesses = await AdminBusiness.find({
      userEmail: email.toLowerCase(),
    }).sort({ timestamp: -1 });

    if (!businesses || businesses.length === 0) {
      return NextResponse.json({
        success: true,
        listings: [],
        count: 0,
      });
    }

    // 🔥 Format business listings
    const formatted = businesses.map((entry) => {
      const userListings = entry.listings.map((listing) => ({
        title: listing.title || listing.accountName || "Untitled",
        locationId: listing.metadata?.name || "N/A",
        verified: listing.hasBusinessAuthority || false,
        category: listing.categories?.primaryCategory?.name || "General",
        phone: listing.phoneNumbers?.primaryPhone || "N/A",
        website: listing.websiteUri || "",
        address: {
          addressLines: listing.storefrontAddress
            ? [`${listing.storefrontAddress.locality}`]
            : ["N/A"],
          locality: listing.storefrontAddress?.locality || "N/A",
        },
      }));

      return {
        userEmail: entry.userEmail,
        userName: userListings[0]?.accountName || "Unknown User",
        userImage: "",
        totalListings: userListings.length,
        verifiedCount: userListings.filter((l) => l.verified).length,
        unverifiedCount: userListings.filter((l) => !l.verified).length,
        lastUpdated: entry.timestamp,
        listings: userListings,
      };
    });

    return NextResponse.json({
      success: true,
      listings: formatted,
      count: formatted.length,
    });
  } catch (error) {
    console.error("❌ Error fetching businesses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
