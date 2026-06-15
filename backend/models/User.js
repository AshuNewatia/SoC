import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  githubId: { type: String },
  avatar: { type: String },
  hasPassword: { type: Boolean, default: false },
  resetOtp: String,
  otpExpires: Date,
  year: { type: String }, // or Number
  branch: { type: String }
});

export default mongoose.model('User', userSchema);