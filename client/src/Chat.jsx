import {useEffect, useState, useRef, useContext} from "react";
import { UserContext } from "./UserContextProvider";
import Logo from "./Logo";
import OnlinePeople from "./OnlinePeople";
import OfflinePeople from "./OfflinePeople";
import Logout from "./Logout";
import InputField from "./InputField";
import axios from "axios";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [inputMsg, setInputMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [offlinePeople, setOfflinePeople] = useState({});

  // auto scroll to latest msg when user sends a msg
  const divUnderMessages = useRef(null);

  // we must not show the currentUser in contacts
  // excluding "this"/current user
  const {id, user, setId, setUser} = useContext(UserContext);
  const properOnlinePeople = {...onlinePeople};
  delete properOnlinePeople[id];

  function showOnlinePeople(peopleArray) {
    // there might be multiple connections for single user (diff devices or within same device)
    // remove duplicate entries
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      // making id as prop key
      people[userId] = username;
    });
    setOnlinePeople(people);
    // console.log(people);
  }

  function sendMessage(e, file = null) {
    if(e) e.preventDefault();
    // send msg + user id (receiver of the msg) to the web socket server 
    ws.send(JSON.stringify({
        recipient: selectedUserId,
        text: inputMsg,
        file
    }));
    setInputMsg("");
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: id,
      recipient: selectedUserId,
      text: inputMsg
    }]);

    // to display url of the file (for the sender)
    // refetch from the db to get the uploaded file name
    // filename will be available only after the file sent to the server
    if(file) {
      // while sending large attachments - it may cause delay
      axios.get("/messages/" + selectedUserId)
        .then(res => {
          setMessages(res.data);
        })
        .catch(console.log(err));
    }
  }

  function sendFile(e) {
    const reader = new FileReader();
    // reading the file as base64url format
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      sendMessage(null, {
        name: e.target.files[0].name,
        data: reader.result
      });
    };
  }

  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    console.log("got new msg");
    // to display online users
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);   
    } else if("text" in messageData) { // to handle msg from another user
      if(messageData.sender === selectedUserId) {
        // to properly send to the crt recipient
        // to avoid receiving from wrong users
        setMessages(prev => [...prev, { ...messageData }]);
    } 
  }
  }

  function logout() {
    // making the token cookie empty
    axios.post("/logout")
      .then(res => {
        // to terminate the ws connection
        setWs(null);
        // this takes to register page by changing the state of entire app
        setId(null);
        setUser(null);
      })
      .catch(err => {
        console.log(err);
      })
  }

  useEffect(() => {
     const ws = new WebSocket("ws://localhost:3000");
     setWs(ws);
     // event sent by wss (ws server)
     ws.addEventListener("message", handleMessage);
    
     // to reconnect - if connection is closed b/w client & server
    //  ws.addEventListener("close", () => {
    //    setWs(null); 
    //    console.log("ws connection closed");
    //    // Reconnect after 2 seconds
    //    setTimeout(() => {
    //      const newWs = new WebSocket("ws://localhost:3000");
    //      newWs.addEventListener("open", () => {
    //        console.log("ws connection reconnected");
    //        setWs(newWs);
    //      });
    //      newWs.addEventListener("error", (error) => {
    //        console.error("ws connection error:", error);
    //      });
    //      newWs.addEventListener("close", () => {
    //        console.log("ws reconnection failed");
    //      });
    //    }, 2000);
    //  });

   
    // closing connection - or else multiple connections will be created
    return () => {
      ws.close();
      console.log("connection closed");
    };
  }, []);

  // auto scroll to recent msg
  useEffect(() => {
    const div = divUnderMessages.current;
   if(div) {
    div.scrollIntoView({behavior: "smooth", block: "end"});
   }
  }, [messages]);

  // to retrieve back the messages from db
  useEffect(() => {
    if(selectedUserId) {
      axios.get("/messages/" + selectedUserId)
        .then(res => {
          setMessages(res.data);
        })
        .catch(err => console.log(err))
    }
  }, [selectedUserId])

  // to show offline people
  // when onlinePeople changes -> it will execute
  // people may go from online to offline, so onlinePeople is dependency
  useEffect(() => {
    axios.get("/people")
    .then(res => {
      // not including our id
      // excluding onlinePeople
        const offlinePeopleArr = res.data
          .filter(p => p._id !== id)
          .filter(p => !Object.keys(onlinePeople).includes(p._id))

        const offlinePeople = {};
        offlinePeopleArr.map((p) => {
          offlinePeople[p._id] = p.username;      
        })
        setOfflinePeople(offlinePeople);
      })
      .catch(err => console.log(err))

  
  }, [onlinePeople]);

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 pl-4 pt-4 flex flex-col">
        <div className="flex-grow">
          <Logo></Logo>
          <OnlinePeople
            properOnlinePeople={properOnlinePeople}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
          ></OnlinePeople>
          <OfflinePeople
            offlinePeople={offlinePeople}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
          ></OfflinePeople>
        </div>
        <Logout user={user} logout={logout}></Logout>
      </div>
      <div className="flex flex-col bg-blue-100 w-2/3 p-2">
        <div className="flex-grow">
          {selectedUserId ? (
            <div></div>
          ) : (
            <div className="h-full flex justify-center items-center">
              <span className="text-gray-400">&larr; Select a person</span>
            </div>
          )}

          {!!selectedUserId && (
            <div className="relative h-full">
              <div className="absolute inset-0 overflow-y-auto ">
                {messages.length > 0 &&
                  messages.map((message) => (
                    <div
                      className={`${
                        message.sender === id ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`inline-block max-w-96 p-2 my-2 rounded-sm text-sm ${
                          message.sender === id
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-500"
                        }`}
                      >
                        {message.text}
                        {message.file && (
                          <div className="">
                            <a
                              className="flex items-center gap-1 underline"
                              target="_blank"
                              href={
                                axios.defaults.baseURL +
                                "/uploads/" +
                                message.file
                              }
                            >
                              <svg
                                className="w-4 h-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="w-6 h-6"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
                                />
                              </svg>

                              {message.file}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                <div ref={divUnderMessages} className="h-4"></div>
              </div>
            </div>
          )}
        </div>
        <InputField
          selectedUserId={selectedUserId}
          sendMessage={sendMessage}
          inputMsg={inputMsg}
          setInputMsg={setInputMsg}
          sendFile={sendFile}
        ></InputField>
      </div>
    </div>
  );
}
export default Chat;