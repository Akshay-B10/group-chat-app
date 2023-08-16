const { DataTypes } = require("sequelize");

const sequelize = require("../utils/config");

const ArchivedMessage = sequelize.define("archivedmessage", {
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
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = ArchivedMessage;