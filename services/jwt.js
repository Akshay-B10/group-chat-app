const jwt = require("jsonwebtoken");

exports.encodeToken = (id) => {
    const secretKey = process.env.JWT_KEY;
    return jwt.sign({
        id: id
    }, secretKey);
};

exports.decodeToken = (token) => {
    return jwt.verify(token, process.env.JWT_KEY);
};
