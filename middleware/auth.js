const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.header("Authorization");
        if (!token) {
            throw ("User authentication failed");
        }
        const secretKey = "temporaryRandomstring";
        const unknownUser = jwt.verify(token, secretKey);
        if (!unknownUser) {
            throw ("Enter valid email and password");
        }
        const user = await User.findOne({
            where: {
                id: unknownUser.id
            }
        });
        req.user = user;
        next();
    } catch (err) {
        res.status(500).json({
            message: err
        });
    }
};