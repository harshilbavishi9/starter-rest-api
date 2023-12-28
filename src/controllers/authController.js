const bcrypt = require("bcrypt");
const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");

module.exports.signup = async (req, res) => {
    try {
        console.log(req.body);
        const { username, password, email } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const createduser = new User({
            username: username,
            password: hashedPassword,
            email: email,
        });
        const saveuser = await createduser.save();
        // res.status(200).send({
        //     success: true,
        //     message: "user saved successfully",
        //     data: {
        //         user: username,
        //     },
        // });
        return res.redirect('/api/user/login')
    } catch (e) {
        console.log(e);
        res.status(500).send({
            success: false,
            message: e.message,
        });
    }
};

module.exports.login = async (req, res) => {
    try {
        return res.redirect('dashboard')

    } catch (e) {
        return res.status(500).send({
            success: false,
            message: e.message,
        });
    }
};


module.exports.authgoogle = (req, res) => {
    if (req.isAuthenticated()) {
        let user = User.findOne({
            email: req.user.emails[0].value,
        });
        console.log(req.user.emails[0].value);
        if (user) {
            let newUser = User.create({
                // googleId: req.user.id,
                username: req.user.displayName,
                email: req.user.emails[0].value,
                photo: req.user.photos[0].value,
                // password: crypto.randomBytes(20).toString('hex'),
            });
            res.status(200).json({
                newUser,
                success: true,
                message: "user register successfully",
            })
        } else {
            console.log("user already register !!");
            return false;
        }
    } else {
        return false
    }
}

module.exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await User.updateOne({ jwtToken: refreshToken }, [
                { $unset: ["jwtToken"] },
            ]);
            res.status(200).send({
                success: true,
                message: "You've been logged out",
            });
        } else {
            return res.status(400).send({
                success: false,
                message: "logout error",
            });
        }
    } catch (e) {
        res.status(500).send({
            success: false,
            message: e.message,
        });
    }
};
module.exports.verify = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(403).json("You are not authorized");
    }
    const tokenParts = authHeader.split(" ");
    if (tokenParts.length !== 2) {
        return res.status(401).json({
            success: false,
            message: "Invalid token format",
        });
    }
    const token = tokenParts[1];

    try {
        jwt.verify(token, "1234567890asdfghjkl", (err, user) => {
            if (err) {
                console.log(err);
                res.status(401).json({
                    success: false,
                    message: "Enter a valid token",
                });
            } else {
                req.user = user;
                next();
            }
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message,
        });
    }
};
module.exports.refresh = async (req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken) {
        res.status(401).send({
            success: false,
            message: "You are not authenticated!",
        });
    }
    try {
        const token = await User.findOne(
            { jwtToken: refreshToken },
            { jwtToken: true }
        );
        if (!token) {
            res.status(200).send({
                success: false,
                message: "Refresh token is not valid!",
            });
        }

        jwt.verify(
            refreshToken,
            "YOUR_SECRETKEY_REFRESHTOKEN",
            async (err, user) => {
                if (err) {
                    throw new Error("token is not valid!");
                }
                const newAccessToken = generateToken.generateAccessToken(user);
                const newRefreshToken = generateToken.generateRefreshToken(user);
                await User.updateOne(
                    { jwtToken: refreshToken },
                    { $set: { jwtToken: newRefreshToken } }
                );
                res.status(200).json({
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                });
            }
        );
    } catch (e) {
        res.status(500).send({
            success: false,
            message: e.message,
        });
    }
};
