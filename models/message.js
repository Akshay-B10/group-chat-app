const { DataTypes } = require("sequelize");

const sequelize = require("../utils/config");

const Message = sequelize.define("message", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    sender: DataTypes.STRING,
    recieverId: {
        type: DataTypes.INTEGER, // Either userId of receiver or null for group chat
        allowNull: true
    }
});

module.exports = Message;