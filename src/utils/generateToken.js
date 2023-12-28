const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign(
    { username: user.username, role: user.role, _id: user._id },
    "1234567890asdfghjkl",
    { expiresIn: "20d" }
  );
};
const generateRefreshToken = (user) => {
  return jwt.sign(
    { username: user.username, role: user.role, _id: user._id },
    "1234567890asdfghjkl", { expiresIn: "5h" }
  );
};

module.exports = { generateAccessToken, generateRefreshToken };
