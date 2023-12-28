const Article = require("../Models/articleModel");
const User = require("../Models/userModel");
const uploadToCloudinary = require("../utils/cloudinary");
const cloudinary = require('cloudinary')
const fs = require('fs');
const path = require("path");

module.exports.createArticle = async (req, res) => {
    try {
    console.log(req.files);
    if (req.user._id === req.body.user) {
        if (req.files.length === 11) {
            return res.status(400).json({ success: false, message: "you can only upload 10 image" });

        }
        const { user, description, tag } = req.body;

        if (tag.length >= 5) {
            return res.status(400).json({ success: false, message: "Use a maximum of 5 tags" });
        }
        const userData = await User.findOne({ _id: user });
        if (!userData) {
            return res.status(400).json({ message: "User not found" });
        }
        let mutualFollowings = userData.followings.filter(id => userData.followers.includes(id));
        let commonId = tag.filter(id => mutualFollowings.map(String).includes(id.trim()));
        var localFilePath = req.files;
        let imageData = []
        let imgPath = []
        for (let i = 0; i < localFilePath.length; i++) {
            imgPath = localFilePath[i].path;
            console.log(imgPath);
            let result = await uploadToCloudinary(imgPath);
            imageData.push(result.url)
        }
        const newPost = new Article({
            user,
            description,
            image: imageData,
            imagepath: imgPath.replace(/\\/g, '/'),
            tag: commonId,
        });
        await newPost.save();
        res.status(201).json({ success: true, message: "Article created successfully", newPost: newPost });
    } else {
        res.status(201).json({ success: false, message: "You Can Not Create Artical", });
    }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

module.exports.updateArticle = async (req, res) => {
    try {
        let id = req.params.id;
        let { tag, description } = req.body;
        if (tag.length >= 5) {
            return res.status(400).json({ success: false, message: "Use a maximum of 5 tags" });
        }
        const articleData = await Article.findById({ _id: id }).populate('user');

        if (!articleData) {
            return res.status(400).json({ message: "User not found" });
        }
        var ids = [];
        for (let i = 0; i < articleData.image.length; i++) {
            ids.push(articleData.image[i]);
        }
        await cloudinary.v2.api.delete_resources(ids, function (error, result) {
        });
        let mutualFollowings = articleData.user.followings.filter(id => articleData.user.followers.includes(id));
        let commonId = tag.filter(id => mutualFollowings.map(String).includes(id.trim()));
        let articleNewData = {
            description,
            tag: commonId,
        }
        const newPost = await Article.findByIdAndUpdate(id, articleNewData, { new: true });

        if (!newPost) {
            return res.status(400).json({ success: false, message: "Article not updated" });
        }

        res.status(200).json({
            success: true,
            message: "Article updated successfully",
            newPost: {
                _id: newPost._id,
                user: newPost.user,
                image: newPost.image,
                tag: newPost.tag,
                description: newPost.description,
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: err.message });
    }

};

module.exports.deleteArticle = async (req, res) => {
    try {
        const id = req.params.id;
        const article = await Article.findById({ _id: id });

        if (!article) {
            return res.status(404).json({ success: false, message: 'Article not found' });
        }

        const deletedArticle = await Article.findByIdAndDelete(id);

        if (!deletedArticle) {
            return res.status(404).json({ success: false, message: 'Article not found' });
        }

        if (article.image && Array.isArray(article.image)) {
            for (const imagePath of article.image) {
                const publicId = imagePath.split('/').pop().split('.')[0];
                console.log(publicId);
                await cloudinary.v2.uploader.destroy(publicId);
            }
        }
        if (article.imagepath && Array.isArray(article.imagepath)) {
            for (const imgath of article.imagepath) {
                fs.unlinkSync(path.join(__dirname, "../../", imgath));
            }
        }
        res.status(200).json({ success: true, message: 'Article and associated images deleted successfully' });

    } catch (e) {
        console.log(e);
        res.status(500).send({
            success: false,
            message: e.message,
        });
    }
};

module.exports.getTimeline = async (req, res) => {
    try {
        const userid = req.user._id;
        const page = parseInt(req.query.page) - 1 || 0;
        const limit = parseInt(req.query.limit) || 1;
        const user = await User.findById(userid).select("followings");
        const myArticles = await Article.find({ user: userid })
            .skip(page * limit)
            .limit(limit)
            .sort({ createdAt: "desc" })
            .populate("user");
        const followingsArticles = await Promise.all(
            user.followings.map((followingId) => {
                return Article.find({
                    user: followingId,
                    createdAt: {
                        $gte: new Date(new Date().getTime() - 86400000).toISOString(),
                    },
                })
                    .skip(page * limit)
                    .limit(limit)
                    .sort({ createdAt: "desc" })
                    .populate("user");
            })
        );
        arr = myArticles.concat(...followingsArticles);
        res.status(200).send({
            success: true,
            totalCount: arr.length,
            Articles: arr,
            limit: arr.length,
        });
    } catch (e) {
        res.status(500).send({
            success: false,
            message: e.message,
        });
    }
};
module.exports.getArticlesUser = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        const articles = await Article.find({ user: user._id });
        res.status(200).json(articles);
    } catch (e) {
        res.status(500).send({
            success: false,
            message: e.message,
        });
    }
};

module.exports.getArticle = async (req, res) => {
    try {
        const article = await Article.findOne({ _id: req.params.id }).populate(
            "comment"
        );
        res.status(200).json(article);
    } catch (e) {
        res.status(500).send({
            success: false,
            message: e.message,
        });
    }
};

module.exports.likeUnlike = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article.likes.includes(req.user._id)) {
            await article.updateOne({ $push: { likes: req.user._id } });
            res.status(200).send({
                success: true,
                message: "the article has been liked",
            });
        } else {
            await article.updateOne({ $pull: { likes: req.user._id } });
            res.status(200).send({
                success: true,
                message: "the article has been disliked",
            });
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: e.message,
        });
    }
};
