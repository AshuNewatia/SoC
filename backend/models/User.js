import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: { type: String },

  googleId: { type: String },

  githubId: { type: String },

  avatar: { type: String },

  hasPassword: {
    type: Boolean,
    default: false,
  },

  resetOtp: String,

  otpExpires: Date,

  role: {
    type: String,
    enum: ["student", "professor"],
    default: "student",
  },

  program: {
    type: String,
    enum: ["BTech", "MTech", "PhD", ""],
    default: "",
  },

  year: {
    type: String,
    default: "",
  },

  branch: {
    type: String,
    default: "",
  },

  facultyType: {
    type: String,
    enum: [
      "Assistant Professor",
      "Associate Professor",
      "Professor",
      "",
    ],
    default: "",
  },
});

export default mongoose.model("User", userSchema);