// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  status: {
    type: String,
    enum: ["online", "offline", "playing"],
    default: "offline",
  },
  score: { type: Number, default: 0 },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
