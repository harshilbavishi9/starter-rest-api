const User = require("../Models/userModel");
const Chat = require("../Models/chatModel");

module.exports.chat = async (req, res) => {
    try {
        const findUser = await User.find({}) 
        // return res.json({ success: true, users: findUser });
        return res.render('chat', { data: findUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports.AddChat = async (req,res) =>{
    try {
        let rData = await User.findById(req.body.receiverId);
        let sData = await User.findById(req.body.senderId);
        let data = await Chat.create(req.body);
        await User.findByIdAndUpdate(req.body.receiverId, {totalChat : rData.totalChat + 1});
        await User.findByIdAndUpdate(req.body.senderId, {totalChat : sData.totalChat + 1});
        data ? res.status(200).send({success : true,data: data,msg : 'Chat inserted!'}) : res.redirect('back');
    } catch (error) {
        console.log(error);
    }
}
