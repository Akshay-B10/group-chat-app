const { DataTypes } = require("sequelize");

const sequelize = require("../utils/config");

const UserGroup = sequelize.define("user-group", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    }
});

module.exports = UserGroup;