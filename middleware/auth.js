const User = require("../models/user");

const JWTService = require("../services/jwt");

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.header("Authorization");
        if (!token) {
            throw ("User authentication failed");
        }
        const unknownUser = JWTService.decodeToken(token);
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