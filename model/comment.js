const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user_id: { type: String },
    message: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("comment", commentSchema);