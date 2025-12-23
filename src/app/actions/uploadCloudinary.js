"use server";

import crypto from "crypto";

export async function getCloudinarySignatureAction() {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cloudinary credentials are not configured in .env.local");
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "gmb-app";

    // Generate Signature: Sort params by name (folder, timestamp)
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + apiSecret)
      .digest("hex");

    return {
      success: true,
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    };
  } catch (error) {
    console.error("Signature Generation Error:", error);
    return { success: false, error: error.message };
  }
}