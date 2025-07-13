import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  status: {
    type: String,
    enum: ["online", "offline", "playing"],
    default: "offline",
  },
  score: { type: Number, default: 0 },
});

const User = mongoose.model("User", userSchema);
export default User;
