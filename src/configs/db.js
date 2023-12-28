const mongoose = require("mongoose");

let DATABASE = "mongodb+srv://harshilbavishi96:OefsZowY30ZrO558@media.dmc1ain.mongodb.net/?retryWrites=true&w=majority"

function connects() {
  return mongoose.connect(DATABASE)
    .then(() => {
      console.log("Database Connected successfully ")
    })
    .catch((error) => {
      console.log("Database Some Error ")
    });
}

module.exports = connects;