const http = require("http");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");
const socketIo = require("socket.io");

const sequelize = require("./utils/config");
require("./controllers/archived-message");

const userRoutes = require("./routes/user");
const messageRoutes = require("./routes/message");
const groupRoutes = require("./routes/group");

const User = require("./models/user");
const Message = require("./models/message");
const Group = require("./models/group");
const UserGroup = require("./models/user-group");

const app = express();

app.use(bodyParser.json());
app.use(cors({
    origin: "http://44.201.83.42",
    methods: ["GET", "POST"],
    credentials: true
}));

app.use("/user", userRoutes);

app.use("/message", messageRoutes);

app.use("/group", groupRoutes);

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// Relations
User.hasMany(Message);
Message.belongsTo(User);

Group.hasMany(Message);
Message.belongsTo(Group);

Group.belongsToMany(User, { through: UserGroup });
User.belongsToMany(Group, { through: UserGroup });

// WebSocket
app.get("/socket.io/socket.io.js", (req, res) => {
    res.set("Content-Type", "application/javascript");
    res.sendFile(path.join(__dirname, "/node_modules/socket.io/client-dist/socket.io.js"));
});

const server = http.createServer(app);
const io = socketIo(server);
const users = {};

io.on("connection", (socket) => {

    socket.on("connect-user", (name, group) => {
        users[socket.id] = {
            name: name,
            groups: [group]
        };
    });

    socket.on("join-group", (newGroup, prevGroup) => {
        let message = "";
        if (io.sockets.adapter.rooms[newGroup] && io.sockets.adapter.rooms[newGroup].sockets[socket.id]) {
            message = message + `Group already connected: ${newGroup}`;
        } else {
            socket.join(newGroup);
            message = message + `Group connected: ${newGroup}`;
        };
        if (prevGroup) {
            socket.leave(prevGroup);
            message = message + `Group left: ${prevGroup}`;
        };
        socket.emit("group-connection", message);
    });

    socket.on("send-message", (data, group) => {
        if (group == "") {
            socket.broadcast.emit("display-to-members", data);
        } else {
            socket.to(group).emit("display-to-members", data);
        }
    });

    socket.on("disconnect", () => {
        delete users[socket.id];
    });
});

sequelize
    .sync()
    .then(() => {
        server.listen(Number(process.env.PORT));
    })
    .catch((err) => console.log(err));