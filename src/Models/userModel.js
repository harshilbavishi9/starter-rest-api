const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: false,
    unique: false,
  },
  email: {
    type: String,
    required: false,
    unique: false,
  },
  password: {
    type: String,
    require: false,
  },
  description: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "http://res.cloudinary.com/df8upxysb/image/upload/v1698845503/gm6m0on7hvmvpeemteyr.jpg",
  },
  imagePath: {
    type: String,
    require: false
  },
  followers: {
    type: Array,
    default: [],
  },
  followings: {
    type: Array,
    default: [],
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    required: false,
    default: "user",
  },
  gender: {
    type: String,
    enum: ["male", "female"],
  },
});
const User = mongoose.model("User", UserSchema);
module.exports = User
