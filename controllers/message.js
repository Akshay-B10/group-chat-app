const { Op } = require("sequelize");
const Message = require("../models/message");
const sequelize = require("../utils/config");

const JWTService = require("../services/jwt");
const S3Service = require("../services/aws-s3");

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

exports.sendMultiMedia = async (req, res) => {
    try {
        const fileName = `${new Date}_${req.file.originalname}`;
        const fileUrl = await S3Service.uploadToS3(fileName, req.file.buffer);
        await req.user.createMessage({
            message: fileUrl,
            sender: req.user.name,
            groupId: +req.query.groupId
        });
        res.status(201).json({
            message: fileUrl
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false
        });
    }
};