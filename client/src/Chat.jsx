import {useEffect, useState, useRef, useContext} from "react";
import { UserContext } from "./UserContextProvider";
import Avatar from "./Avatar";
import Logo from "./Logo";
import axios from "axios";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [inputMsg, setInputMsg] = useState("");
  const [messages, setMessages] = useState([]);
  // auto scroll to latest msg when user sends a msg
  const divUnderMessages = useRef(null);

  // we must not show the currentUser in contacts
  // excluding "this"/current user
  const {id} = useContext(UserContext);
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

  function sendMessage(e) {
    e.preventDefault();
    // send msg + user id (receiver of the msg) to the web socket server 
    ws.send(JSON.stringify({
        recipient: selectedUserId,
        text: inputMsg
    }));
    setInputMsg("");
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: id,
      recipient: selectedUserId,
      text: inputMsg
    }]);
  }

  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    // to display online users
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);   
    } else if("text" in messageData) { // to handle msg from another user
      console.log("got new msg");
      setMessages(prev => [...prev, { ...messageData }]);
    } 
  }

  function connectToWs() {
    // ws represents ws connection b/w client and server
    const ws = new WebSocket("ws://localhost:3000");
    setWs(ws);
    // event sent by wss (ws server)
    ws.addEventListener("message", handleMessage);

    // for auto re-connection
    // when the server is restarted
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("disconnected, trying to reconnect...")
        connectToWs();
      }, 1000);
    });
  }

  useEffect(() => {
    connectToWs();
   
    // closing connection
    // return () => {
    //   ws.close();
    //   console.log("connection closed");
    // };
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
      axios.get("/messages/" + selectedUserId);
    }
  }, [selectedUserId])

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 pl-4 pt-4">
        <Logo></Logo>
        {Object.keys(properOnlinePeople).length > 0 &&
          Object.keys(properOnlinePeople).map((userId) => (
            <div
              key={userId}
              onClick={() => {
                setSelectedUserId(userId);
              }}
              className={`border-b border-gray-100 flex items-center gap-2 cursor-pointer ${
                userId === selectedUserId ? "bg-blue-100" : ""
              }`}
            >
              {userId === selectedUserId && (
                <div className="w-1 bg-blue-500 h-16 rounded-r-md"></div>
              )}
              <div className="flex gap-2 px-4 py-4">
                <Avatar
                  id={userId}
                  username={properOnlinePeople[userId]}
                ></Avatar>
                <span className="text-gray-800">
                  {properOnlinePeople[userId]}
                </span>
              </div>
            </div>
          ))}
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

          { !!selectedUserId && (
            <div className="relative h-full">
              <div className="absolute inset-0 overflow-y-auto ">
              {messages.length > 0 && messages.map(message => (
                <div className={`${message.sender === id ? "text-right" : "text-left"}`}>
                  <div className={`inline-block max-w-96 p-2 my-2 rounded-sm text-sm ${message.sender === id ? "bg-blue-500 text-white" : "bg-white text-gray-500" }`}>
                    {message.text}
                  </div>
                </div>
              )) }
              <div ref={divUnderMessages} className="h-4"></div>
              </div>
            </div>
          )}
        </div>
        {!!selectedUserId && 
          <form className="flex gap-2" onSubmit={sendMessage}>
            <input
              onChange={(e) => setInputMsg(e.target.value)}
              value={inputMsg}
              type="text"
              placeholder="type your message here"
              className="bg-white border p-2 flex-grow rounded-sm"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-sm"
            >
              <svg
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
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        }
      </div>
    </div>
  );
}
export default Chat;