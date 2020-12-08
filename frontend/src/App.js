import React, { useEffect, useState } from "react";
import axios from "./axios";
import "./App.css";
import Sidebar from "./components/Sidebar/Sidebar";
import Pusher from "pusher-js";
import Chat from "./components/Chat/Chat";

function App() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios.get("/messages/sync").then((res) => {
      console.log(res);
      setMessages(res.data);
    });
  }, []);

  useEffect(() => {
    const pusher = new Pusher("5d98afad589775a5c218", {
      cluster: "eu",
    });

    const channel = pusher.subscribe("messages");
    channel.bind("inserted", (newMessage) => {
      setMessages([...messages, newMessage]);
    });
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [messages]);

  return (
    <div className="app">
      <div className="app__body">
        <Sidebar />
        <Chat messages={messages} />
      </div>
    </div>
  );
}

export default App;
