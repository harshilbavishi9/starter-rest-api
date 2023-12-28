const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    senderId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
      },
      receiverId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
      },
      msg :{
        type : String,
        required : true
      },
      msgtime : {
        type : String,
        required : true
      }
}, {
    timestamps: true
})

const Chat = mongoose.model("Chat", ChatSchema);
module.exports = Chat;