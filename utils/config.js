const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("group-chat-app", "root", "MonkeyD.Luffy", {
    dialect: "mysql",
    host: "localhost"
});

module.exports = sequelize;