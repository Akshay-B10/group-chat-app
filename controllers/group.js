const { Op } = require("sequelize");
const User = require("../models/user");

const JWTService = require("../services/jwt");

const Group = require("../models/group");

exports.getAllGroup = async (req, res) => {
    try {
        const groups = await req.user.getGroups({
            attributes: ["id", "name", "isGroup"],
            include: [
                {
                    model: User,
                    attributes: ["name"],
                    where: {
                        id: {
                            [Op.ne]: req.user.id
                        }
                    }
                }
            ]
        });
        const encodedGroups = groups.map(group => {
            return {
                id: group.id,
                name: group.name || group.users[0].name,
                isGroup: group.isGroup,
            }
        });
        res.json(encodedGroups);
    } catch (err) {
        res.status(500).json({
            err,
            message: "Failed to fetch dm's/groups"
        });
    }
};

exports.create = async (req, res) => {
    try {
        const { name, members } = req.body;
        const membersId = members.map(member => {
            return JWTService.decodeToken(member.id).id;
        });
        const users = await User.findAll({
            where: {
                id: membersId
            }
        });
        if (users.length !== membersId.length) {
            return res.status(404).json({
                message: "One or more user not found"
            });
        };
        const group = await req.user.createGroup({
            name: name,
            isGroup: true,
            createdBy: req.user.id
        });
        await req.user.createMessage({
            message: `${req.user.name} joined`,
            groupId: group.id
        });
        for (const user of users) {
            await group.addUser(user);
            await user.createMessage({
                message: `${user.name} joined`,
                groupId: group.id
            });
        };
        res.json({
            id: group.id,
            name: group.name || users[0].name
        });
    } catch (err) {
        res.status(500).json({
            message: "Something went wrong",
            err
        });
    }
}