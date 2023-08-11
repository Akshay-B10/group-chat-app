const { Op } = require("sequelize");
const Message = require("../models/message");
const sequelize = require("../utils/config");

const JWTService = require("../services/jwt");

exports.getAllNewMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const lastMsgId = +req.query.lastMsgId;
        const groupId = +req.query.groupId;
        const messages = await Message.findAll({
            where: {
                id: {
                    [Op.gt]: lastMsgId
                },
                groupId: groupId
                /*
                [Op.and]: [{
                    id: {
                        [Op.gt]: lastMsgId
                    },
                    groupId: groupId
                }]
                */
            },
            attributes: ["id", "message", "sender",
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
};

exports.sentMsg = async (req, res) => {
    try {
        const msg = req.body.message;
        const groupId = +req.query.groupId;
        await req.user.createMessage({
            message: msg,
            sender: req.user.name,
            groupId: groupId
        });
        res.json({
            message: "Success"
        });
    } catch (err) {
        res.status(500).json({
            message: "Error sending message",
            err: err
        })
    }
};