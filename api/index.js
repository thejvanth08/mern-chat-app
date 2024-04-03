const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.get("/test", (req, res) => {
  res.json("test is OK");
})

app.listen(port, console.log(`Server is running at port ${port}`));
