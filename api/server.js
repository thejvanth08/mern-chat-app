const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 3000;

// to parse UrlEncoded (default enctype) - form data
// POST -> available in req.body
// GET -> available in req.query
app.use(express.urlencoded({ extended: true }));

// to parse json data - axios
app.use(express.json());

app.use(cors({
  credentials: true,
  origin: "*"
}));

app.get("/test", (req, res) => {
  res.json("test is OK");
})

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  console.log(username + " " + password);
  const createdUser = await User.create({ username, password });
  
  // creating/generating new jwt
  const token = jwt.sign({userId: createdUser._id}, process.env.JWT_SECRET, { expiresIn: "1h"})
  res.cookie("token", token).status(201).json({id: createdUser._id});
});


const start = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("connected to DB");
  app.listen(port, console.log(`Server is running at port ${port}`));
}

start();
