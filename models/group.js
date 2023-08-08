const { DataTypes } = require("sequelize");

const JWTService = require("../services/jwt");

const sequelize = require("../utils/config");

const Group = sequelize.define("group", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    isGroup: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    createdBy: {
        type: DataTypes.INTEGER, // User id
        defaultValue: null
    }
});

module.exports = Group;