const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const sequelize = require("./utils/config");

const userRoutes = require("./routes/user");
const messageRoutes = require("./routes/message");

const User = require("./models/user");
const Message = require("./models/message");

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
// app.use(cors());

app.use("/user", userRoutes);

app.use("/message", messageRoutes);

// Relations
User.hasMany(Message);

sequelize
    .sync()
    .then(() => {
        app.listen(3000);
    })
    .catch((err) => console.log(err));