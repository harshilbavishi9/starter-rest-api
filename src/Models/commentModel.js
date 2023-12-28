const mongoose = require("mongoose");
const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  description: { type: String },
});
const Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment 
