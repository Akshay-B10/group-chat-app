const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const sequelize = require("./utils/config");

const userRoutes = require("./routes/user");

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
//app.use(cors());

app.use("/user", userRoutes);

sequelize
    .sync()
    .then(() => {
        app.listen(3000);
    })
    .catch((err) => console.log(err));