const path = require("path");

const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

const JWTService = require("../services/jwt");

const sequelize = require("../utils/config");
const User = require("../models/user");
const Group = require("../models/group");

exports.getSignUp = (req, res) => {
    res.sendFile(path.join(__dirname, "../", "views", "signup.html"));
};

exports.getLogin = (req, res) => {
    res.sendFile(path.join(__dirname, "../", "views", "login.html"));
};

exports.loginAuthenticate = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email == "" || password == "") {
            throw ("Please fill required details")
        }
        const user = await User.findOne({
            where: {
                email: email
            }
        });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        const result = await bcrypt.compare(password, user.password);
        if (!result) {
            return res.status(401).json({
                message: "User not authorized"
            });
        }
        res.json({
            message: "User successfully logged in",
            token: JWTService.encodeToken(user.id)
        });
    } catch (err) {
        res.status(400).json({
            err,
            message: "Something went wrong"
        });
    }
};

exports.getIndex = (req, res) => {
    res.sendFile(path.join(__dirname, "../", "views", "index.html"));
}

exports.addUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (email == "" || phone == "" || password == "") {
            throw ("Please fill required details");
        }
        const user = await User.findOne({
            where: {
                email: email
            }
        });
        if (user) {
            throw ("User already exist");
        }
        const validPhone = parseInt(phone);
        if (phone.length != 10 || !validPhone || validPhone.toString().length != 10) {
            throw ("Invalid mobile number");
        }
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);
        const newUser = await User.create({
            name: name,
            email: email,
            phone: phone,
            password: hash
        });
        /*
        // Making group of two people: Indicating Personal Chat By default with all other users
        const existingUsers = await User.findAll({
            where: {
                id: {
                    [Op.ne]: newUser.id
                }
            }
        });
        if (existingUsers.length > 0) {
            await sequelize.transaction(async (t) => {
                for (const existingUser of existingUsers) {
                    const group = await Group.create({ t });
                    await group.addUsers([newUser, existingUser], { t });
                }
            })
        };
        */
        res.json({
            message: "User created successfully"
        });
    } catch (err) {
        res.status(400).json({
            message: err
        });
    }
};

exports.getContacts = async (req, res) => {
    try {
        const contacts = await User.findAll({
            where: {
                id: {
                    [Op.ne]: req.user.id
                }
            }
        });
        const data = contacts.map(contact => {
            return {
                id: JWTService.encodeToken(contact.id),
                name: contact.name
            };
        })
        res.json(data);
    } catch (err) {
        res.status(500).json({
            message: "Something went wrong"
        });
    }
};