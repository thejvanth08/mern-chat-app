const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const Message = require("./models/Message");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const ws = require("ws");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

const jwtSecret = process.env.JWT_SECRET;
const salt = bcrypt.genSaltSync(10);
let server;

async function getUserDataFromRequest(req) {
  const token = req.cookies?.token;
  return new Promise((resolve, reject) => {
    if (token) {
      // userData (payload in jwt) -> decoded using verify()
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject("no token");
    }
  })
  
}

// uploads folder files will be publicly available
// anyone can see this who has the url of image (without auth also)
app.use("/uploads", express.static(__dirname + "/uploads"));

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

app.post("/logout", (req, res) => {
  res.cookie("token", "", {sameSite: "none", secure: true}).json("ok");
});

app.get("/messages/:userId", async (req, res) => {
  // userId -> id of recipient
  const { userId } = req.params;
  // getting sender data
  const userData = await getUserDataFromRequest(req);
  const ourUserId = userData?.userId || false;
  if(!ourUserId) {
    res.json("can't retrieve messages from db");
  }
  const messages = await Message.find({
    sender: { $in: [userId, ourUserId] },
    recipient: { $in: [userId, ourUserId] }
  }).sort({createdAt: 1});
  res.json(messages);
});

app.get("/people", async (req, res) => {
  const users = await User.find({}, {"_id": 1, username: 1});
  res.json(users);
});


const start = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("connected to DB");

  // this returns server object which can be used to create web socket
  server = app.listen(port, console.log(`Server is running at port ${port}`));
  
  // creating web socket server instance
  // it creates a WebSocket server instance that is attached to an existing HTTP server instance
  const wss = new ws.WebSocketServer({server});
  wss.on("connection", (connection, req) => {

    // to send about onlinePeople to the clients
    function notifyAboutOnlinePeople() {
      [...wss.clients].forEach((client) => {
        // send msg for each client about each connected user/client
        // when connection is not terminated properly, it adds more connection for single client when browser refreshes
        client.send(
          JSON.stringify({
            online: [...wss.clients].map((c) => ({
              userId: c.userId,
              username: c.username,
            })),
          })
        );
      });
    }

    // clearing the connection after client disconnected
    // this reduces the memory usage in server
    // after connected
    connection.isAlive = true;
    // pinging after connecting (sending)
    connection.timer = setInterval(() => {
      connection.ping();
      // 1sec after pinging
      connection.deathTimer = setTimeout(() => {
        // if it is not received within 1 sec (when client deactivates)
        connection.isAlive = false;
        clearInterval(connection.timer);
        connection.terminate();
        // automatically updates the offlinePeople after 5sec - when the client leaves
        notifyAboutOnlinePeople();
        console.log("dead");
      }, 1000)
    }, 5000);

    // ponging - receiving the ping 
    connection.on("pong", () => {
      // clearing if is received before 1 sec
      clearTimeout(connection.deathTimer);
    });



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

    
    // clients -> ws clients (connected to this ws server) 
    // const clients = [...wss.clients];
    
    // notify everyone about online users
    notifyAboutOnlinePeople();

    // when receives msg from client -> sends msg to another select client (a sends to b)
    connection.on("message", async (message) => {
      const messageData = JSON.parse(message.toString());
      const {recipient, text, file} = messageData;
      let filename;
      if(file) {
        const parts = file.name.split(".");
        const ext = parts[parts.length - 1];
        filename = Date.now() + "." + ext;
        const path = __dirname + "/uploads/" + filename;

        // decode the file (base64 format)
        // get actual data of the file
        const fileData = file.data.split(",")[1];
        const bufferData = Buffer.from(fileData, "base64");
        fs.writeFile(path, bufferData, (err) => {
          if (err) {
            console.error("Error saving file:", err);
          } else {
            console.log("File saved:", path);
          }
        });
      }

      if(recipient && (text || file)) {
        const messageDoc = await Message.create({
          sender: connection.userId,
          recipient,
          text,
          file: file ? filename : null
        });

        // filtering only the receiver client (same user can login in multiple devices -> so it tends to multiple clients)
        [...wss.clients]
          .filter(c => c.userId === recipient)
          .forEach(c => c.send(JSON.stringify({
            id: messageDoc._id,
            sender: connection.userId,
            recipient,
            text,
            file: file ? filename: null
          })));
      }
      
    })
  })

  // to automatically update the offlinePeople list when the user leaves without refreshing the page
  wss.on("close", (data) => {
    console.log("disconnect", data);
  })
}

start();
