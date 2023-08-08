const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const sequelize = require("./utils/config");

const userRoutes = require("./routes/user");
const messageRoutes = require("./routes/message");
const groupRoutes = require("./routes/group");

const User = require("./models/user");
const Message = require("./models/message");
const Group = require("./models/group");
const UserGroup = require("./models/user-group");

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
// app.use(cors());

app.use("/user", userRoutes);

app.use("/message", messageRoutes);

app.use("/group", groupRoutes);

// Relations
User.hasMany(Message);
Message.belongsTo(User);

Group.hasMany(Message);
Message.belongsTo(Group);

Group.belongsToMany(User, { through : UserGroup });
User.belongsToMany(Group, { through : UserGroup });

sequelize
    .sync()
    .then(() => {
        app.listen(Number(process.env.PORT));
    })
    .catch((err) => console.log(err));