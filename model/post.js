const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, unique: true},
    body: { type: String, max: 500},
    user_id: { type: String, required: true},
    comments: {type: Array, default: []},
    likes: {type: Array, default: []}
  },
  { timestamps: true }
  );

module.exports = mongoose.model("post", postSchema);