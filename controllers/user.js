const path = require("path");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

function generateToken(id) {
    const secretKey = "temporaryRandomstring";
    return jwt.sign({
        id: id
    }, secretKey);
}

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
            token: generateToken(user.id)
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
        await User.create({
            name: name,
            email: email,
            phone: phone,
            password: hash
        });
        res.json({
            message: "User created successfully"
        });
    } catch (err) {
        res.status(400).json({
            message: err
        });
    }
};