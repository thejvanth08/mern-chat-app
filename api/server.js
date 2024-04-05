const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// to parse UrlEncoded (default enctype) form data
// POST -> available in req.body
// GET -> available in req.query
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: "*"
}));

app.get("/test", (req, res) => {
  res.json("test is OK");
})

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  console.log(username + " " + password);
  await User.create({ username, password });
});

app.listen(port, console.log(`Server is running at port ${port}`));
