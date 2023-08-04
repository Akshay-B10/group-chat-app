const Message = require("../models/message");
const sequelize = require("../utils/config");

exports.getAllMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const messages = await Message.findAll({
            attributes: ["id", "message",
            [
                sequelize.literal(`userId = ${userId}`),
                "myself"
            ]
        ]
        });
        res.json({
            messages: messages
        });
    } catch (err) {
        res.status(500).json({
            err: err,
            message: "Something went wrong"
        });
    }
}

exports.sentMsg = async (req, res) => {
    try {
        const msg = req.body.message;
        await req.user.createMessage({
            message: msg
        });
        res.json({
            message: "Success"
        })
    } catch (err) {
        res.status(500).json({
            message: "Error sending message",
            err: err
        })
    }
};