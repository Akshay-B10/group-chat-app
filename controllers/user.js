const path = require("path");

const bcrypt = require("bcrypt");

const User = require("../models/user");

exports.getSignUp = (req, res) => {
    res.sendFile(path.join(__dirname, "../", "views", "signup.html"));
};

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