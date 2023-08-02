const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./utils/config");

const app = express();

sequelize
    .sync()
    .then(() => {
        app.listen(3000);
    })
    .catch((err) => console.log(err));