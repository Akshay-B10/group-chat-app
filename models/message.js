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
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Message;