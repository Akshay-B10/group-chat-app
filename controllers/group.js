const { Op, where } = require("sequelize");
const User = require("../models/user");

const JWTService = require("../services/jwt");

const sequelize = require("../utils/config");
const Group = require("../models/group");
const UserGroup = require("../models/user-group");

exports.getAllGroup = async (req, res) => {
    try {
        const groups = await req.user.getGroups({
            attributes: ["id", "name"],
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
            createdBy: req.user.id
        });
        if (group) {
            UserGroup.update({
                isAdmin: true
            }, {
                where: {
                    userId: req.user.id,
                    groupId: group.id
                }
            });
        }
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
};

exports.getDetails = async (req, res) => {
    try {
        const groupId = +req.query.groupId;
        const userDetails = await UserGroup.findOne({
            where: {
                userId: req.user.id,
                groupId: groupId
            },
            attributes: ["isAdmin"]
        });
        const group = await Group.findByPk(groupId, {
            include: [{
                model: User,
                as: "users",
                attributes: ["name", "email", "phone", [
                    sequelize.fn("IF", sequelize.literal(`users.id = ${req.user.id}`), true, false), "myself"
                ]]
            }]
        });
        if (userDetails.isAdmin) {
            const notMembers = await User.findAll({
                where: {
                    email: {
                        [Op.notIn]: group.users.map(user => user.email)
                    }
                },
                attributes: ["name", "email", "phone"]
            });
            return res.json({
                group,
                notMembers,
                status: true
            });
        }
        res.json({
            group,
            status: false
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Could not fetch group details",
            err
        });
    }
};

exports.makeAdmin = async (req, res) => {
    try {
        const { email, groupId } = req.query;
        const user = await User.findOne({
            where: {
                email: email
            }
        });
        if (!user) {
            return res.status(404).json({
                message: "User not found. check your email id"
            });
        }
        await UserGroup.update({
            isAdmin: true
        }, {
            where: {
                userId: user.id,
                groupId: +groupId
            }
        });
        res.json({
            name: user.name,
            email: user.email,
            phone: user.phone,
            myself: false,
            usergroup: {
                isAdmin: true
            }
        });
    } catch (err) {
        res.status(500).json({
            message: "Couldn't make admin"
        });
    }
};

exports.removeMember = async (req, res) => {
    try {
        const { email, groupId } = req.query;
        const user = await User.findOne({
            where: {
                email: email
            }
        });
        if (!user) {
            return res.status(404).json({
                message: "User to be removed not found"
            });
        };
        await UserGroup.destroy({
            where: {
                userId: user.id,
                groupId: +groupId
            }
        });
        res.json({
            name: user.name,
            email: user.email,
            phone: user.phone
        });
    } catch (err) {
        res.status(500).json({
            message: "Couldn't remove user from the group"
        });
    }
};

exports.addMembers = async (req, res) => {
    try {
        const { groupId, members } = req.body;
        const userEmails = members.map(user => user.email);
        const users = await User.findAll({
            where: {
                email: userEmails
            }
        });
        const reqDetails = await Promise.all(users.map(async (user) => {
            await UserGroup.create({
                groupId: +groupId,
                userId: user.id
            });
            await user.createMessage({
                message: `${user.name} joined`,
                groupId: +groupId
            });
            return {
                name: user.name,
                email: user.email,
                phone: user.phone,
                myself: false,
                usergroup: {
                    isAdmin: false
                }
            };
        }));
        res.json({
            message: "Successfully added members to the group",
            users: reqDetails
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Couldn't add members in the group"
        });
    }
};