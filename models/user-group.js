const { DataTypes } = require("sequelize");

const sequelize = require("../utils/config");

const UserGroup = sequelize.define("usergroup", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = UserGroup;