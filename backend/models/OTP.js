import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // ⏳ Auto-deletes from MongoDB after 5 minutes (300s)
  },
});

export default mongoose.model("OTP", otpSchema);