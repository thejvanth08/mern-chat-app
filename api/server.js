const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const ws = require("ws");

const app = express();
const port = process.env.PORT || 3000;

const jwtSecret = process.env.JWT_SECRET;
const salt = bcrypt.genSaltSync(10);
let server;

// to parse UrlEncoded (default enctype) - form data
// POST -> available in req.body
// GET -> available in req.query
app.use(express.urlencoded({ extended: true }));

// to parse json data - axios
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from this origin
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

app.get("/test", (req, res) => {
  console.log("get");
  res.json("test is OK");
})

// to check whether the user is already logged-in
// verify the jwt
app.get("/profile", (req, res) => {
  // user may not have jwt also (when they log-in for first time)
  const token = req.cookies?.token;
  if(token) {
    // userData (payload in jwt) -> decoded using verify()
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if(err) throw err;
      res.json(userData);
    });
  } else {
    res.status(401).json({ "error": "no token" });
  }
});

// sign new jwt
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, salt);
  const createdUser = await User.create({ username, password: hashedPassword });
  
  // creating/generating new jwt
  const token = jwt.sign({userId: createdUser._id, username}, jwtSecret, { expiresIn: "1h"})
  res.cookie("token", token, {sameSite: "none", secure: true }).status(201).json({id: createdUser._id});
});

// sign new jwt
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const userData = await User.findOne({ username });

  if(userData) {
    // check the entered password & actual password are same
    // verify the password
    const isPasswordCrt = bcrypt.compareSync(password, userData.password);
    if(isPasswordCrt) {
      const token = jwt.sign(
        { userId: userData._id, username },
        jwtSecret,
        { expiresIn: "1h" }
      );
      res.cookie("token", token, {sameSite: "none", secure: true}).json({id: userData._id});
    } else {
      res.json("password is wrong");
    }

  } else {
    res.json("user not found");
  }
})





const start = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("connected to DB");

  // this returns server object which can be used to create web socket
  server = app.listen(port, console.log(`Server is running at port ${port}`));
  
  // creating web socket server instance
  // it creates a WebSocket server instance that is attached to an existing HTTP server instance
  const wss = new ws.WebSocketServer({server});
  wss.on("connection", (connection, req) => {
    // req -> info about the connected client
    // getting jwt from req to show user info
    const cookies = req.headers.cookie;
    // there might be more cookies
    const tokenCookie = cookies.split(",").find(str => str.startsWith("token="));
    if(tokenCookie) {
      const token = tokenCookie.split("=")[1];
      // ws auth
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if(err) throw err;
        const {userId, username} = userData;
        // adding diff connections info. (adding all clients)
        // these will be added to wss.clients object for each client
        // each client is property of wss.clients
        connection.userId = userId;
        connection.username = username;
      });
    }

    
    
    // notify everyone about online users
    const clients = [...wss.clients];
    clients.forEach(client => {
      // send msg for each client about each connected user/client
      // when connection is not terminated properly, it adds more connection for single client when browser refreshes
      client.send(
        JSON.stringify({
          online: clients.map((c) => ({
            userId: c.userId,
            username: c.username,
          })),
        })
      );
    })

    // when receives msg from client -> sends msg to another select client (a sends to b)
    connection.on("message", (message) => {
      const messageData = JSON.parse(message.toString());
      const {recipient, text} = messageData;
      if(recipient && text) {
        clients
        .filter(c => c.userId === recipient))
        .forEach(c => c.send(JSON.stringify({text: text})));
        
      }
    })
  })
}

start();
