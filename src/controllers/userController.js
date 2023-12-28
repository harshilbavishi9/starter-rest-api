const bcrypt = require("bcrypt");
const User = require("../Models/userModel");
const uploadToCloudinary = require("../utils/cloudinary");
const { generateOtp } = require("../utils/otp");
const OTP = require("../Models/otp");

module.exports.updateUser = async (req, res) => {
    const id = req.params.id;
    if (req.body.password) {
        return res.status(400).json({
            success: false,
            message: "You cannot change the password.",
        });
    }
    try {
        const localFilePath = req.file.path;
        const result = await uploadToCloudinary(localFilePath);
        const userData = {
            email: req.body.email,
            username: req.body.username,
            description: req.body.description,
            gender: req.body.gender,
            image: result.url,
            imagePath: req.file.path.replace(/\\/g, '/'),
        };
        const user = await User.findByIdAndUpdate(id, userData, { new: true });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "You can't update this account.",
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "Account has been updated successfully",
                user: user,
            });
        }
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            success: false,
            message: "Something went wrong!",
        });
    }
};

module.exports.changePassword = async (req, res) => {
    try {

        const userDetail = await User.findById(req.params.id);
        if (!userDetail) {
            return res.status(404).json({
                success: false,
                message: "User Detail Not Found.",
            });
        }

        const isMatch = await bcrypt.compare(req.body.currentPass, userDetail.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current Password and New Password Do Not Match.",
            });
        }

        if (req.body.newPass !== req.body.confirmPass) {
            return res.status(400).json({
                success: false,
                message: "New Password and Confirm Password Do Not Match.",
            });
        }

        const encryptedPassword = await bcrypt.hash(req.body.newPass, 10);

        const passUpdateData = {
            password: encryptedPassword,
        };

        const updatedUser = await User.findByIdAndUpdate(userDetail._id, passUpdateData, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        res.status(200).json({
            success: true,
            updatedUser,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
        });
    }
};

module.exports.otpSendByEmail = async (req, res) => {
    try {
        // Add validation for email and other fields.

        const id = req.params.id;
        const findUser = await User.findById(id);

        if (!findUser) {
            return res.status(404).json({
                status: false,
                message: "User not found",
            });
        }

        const email = req.body.email;
        let otpFind = await OTP.findOne({ email: email });

        if (!otpFind) {
            let otp = {
                email: email,
                otp: generateOtp(),
                expireTime: new Date(Date.now() + 5 * 60 * 1000).getTime(),
            };

            let sendOtp = await OTP.create(otp);
            if (!sendOtp) {
                return res.status(500).json({
                    status: false,
                    message: "Unable to send OTP",
                });
            }

            return res.status(200).json({
                status: true,
                message: "OTP sent successfully",
                sendOtp: sendOtp,
            });
        } else {
            let otp = {
                email: email,
                otp: generateOtp(),
                expireTime: new Date(Date.now() + 5 * 60 * 1000).getTime(),
            };

            let sendOtp = await OTP.findOneAndUpdate({ email: email }, otp);

            if (!sendOtp) {
                return res.status(500).json({
                    status: false,
                    message: "Unable to send OTP",
                });
            }

            return res.status(200).json({
                status: true,
                message: "OTP sent successfully",
                sendOtp: otp,
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports.verifyOtp = async (req, res) => {
    try {
        // Add validation for email and otp fields.

        const email = req.body.email;
        const userOTP = req.body.otp;

        const otpFind = await OTP.findOne({ email: email });

        if (!otpFind) {
            return res.status(404).json({
                status: false,
                message: "OTP not found or expired",
            });
        }

        if (otpFind.expireTime < Date.now()) {
            return res.status(400).json({
                status: false,
                message: "OTP has expired",
            });
        }

        if (otpFind.otp !== userOTP) {
            return res.status(400).json({
                status: false,
                message: "Incorrect OTP",
            });
        }

        return res.status(200).json({
            status: true,
            message: "OTP verified successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


module.exports.getUser = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findOne({ _id: id });
        if (!user) {
            throw new Error("user does not exist");
        }
        const { password, jwtToken, __v, role, ...otherInfo } = user._doc;
        res.status(200).send({
            success: true,
            message: "user info",
            user: otherInfo,
        });
    } catch (e) {
        res.status(500).send({
            success: false,
            message: e.message,
        });
    }
};

module.exports.getUserByUsername = async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username: username });
        if (!user) {
            throw new Error("user does not exist");
        }
        const { password, jwtToken, __v, role, ...otherInfo } = user._doc;
        res.status(200).send({
            success: true,
            message: "user info",
            user: otherInfo,
        });
    } catch (e) {
        res.status(500).send({
            success: false,
            message: e.message,
        });
    }
};

module.exports.getFollowings = async (req, res) => {
    try {
        const username = req.params.username;
        const userfollowings = await User.findOne({ username: username });
        if (!userfollowings) {
            throw new Error("user does not exist");
        }
        const followings = await Promise.all(
            userfollowings.followings.map((following) => {
                return User.findById(following, {
                    username: true,
                    profilePicture: true,
                });
            })
        );
        res.status(200).send({
            success: true,
            message: "user info",
            followings: followings,
        });
    } catch (e) {
        res.status(500).send({
            success: false,
            message: e.message,
        });
    }
};

module.exports.getAllFollowings = async (req, res) => {
    try {
        const username = req.params.username;
        const userFollowings = await User.findOne({ username: username });

        if (!userFollowings) {
            throw new Error("User does not exist");
        }

        const followings = await Promise.all(
            userFollowings.followings.map((following) => {
                return User.findById(following, {
                    username: true,
                    profilePicture: true,
                });
            })
        );

        res.status(200).send({
            success: true,
            message: "User's followings",
            followings: followings,
        });
    } catch (e) {
        res.status(500).send({
            success: false,
            message: e.message,
        });
    }

}

module.exports.getFollowers = async (req, res) => {
    try {
        const username = req.params.username;
        const userfollowers = await User.findOne({ username: username });
        if (!userfollowers) {
            throw new Error("user does not exist");
        }
        const followers = await Promise.all(
            userfollowers.followers.map((follower) => {
                return User.findById(follower, {
                    username: true,
                    profilePicture: true,
                });
            })
        );
        res.status(200).send({
            success: true,
            message: "user info",
            data: {
                followings: followers,
            },
        });
    } catch (e) {
        res.status(500).send({
            success: false,
            message: e.message,
        });
    }
};

module.exports.followUser = async (req, res) => {
    try {
        const currentUser = await User.findById({ _id: req.user._id });
        if (currentUser.username !== req.params.username) {
            const usertofollow = await User.findOne({
                username: req.params.username,
            });
            if (!usertofollow) {
                throw new Error("user does not exist");
            }
            if (!currentUser.followings.includes(usertofollow._id)) {
                await currentUser.updateOne({
                    $push: { followings: usertofollow._id },
                });
                await usertofollow.updateOne({
                    $push: { followers: currentUser._id },
                });
                res.status(200).send({
                    success: true,
                    message: "user has been followed",
                });
            } else {
                res.status(400).send({
                    success: true,
                    message: "you allready follow this user",
                });
            }
        } else {
            throw new Error("you can't follow yourself");
        }
    } catch (e) {
        res.status(500).send({
            success: false,
            message: e.message,
        });
    }
};

module.exports.unfollowUser = async (req, res) => {
    try {
        const currentUser = await User.findById({ _id: req.user._id });
        if (currentUser.username !== req.params.username) {
            const usertounfollow = await User.findOne({
                username: req.params.username,
            });
            if (!usertounfollow) {
                throw new Error("user does not exist");
            }
            if (currentUser.followings.includes(usertounfollow._id)) {
                await currentUser.updateOne({
                    $pull: { followings: usertounfollow._id },
                });
                await usertounfollow.updateOne({
                    $pull: { followers: currentUser._id },
                });
                res.status(200).send({
                    success: true,
                    message: "user has been unfollowed",
                });
            } else {
                res.status(400).send({
                    success: true,
                    message: "you don't follow this user",
                });
            }
        } else {
            throw new Error("you can't unfollow yourself");
        }
    } catch (e) {
        res.status(500).send({
            success: false,
            message: e.message,
        });
    }
};

module.exports.searchUsers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || "";
        const users = await User.find({
            username: { $regex: search, $options: "i" },
        })
            .select("_id username profilePicture")
            .limit(limit);
        const totalUsers = users.length;
        res.status(200).send({
            success: true,
            totalUsers: totalUsers,
            limit: limit,
            users: users,
        });
    } catch (e) {
        res.status(500).send({
            success: false,
            message: e.message,
        });
    }
};

module.exports.profileview = async (req, res) => {
    return res.render('profile')
}