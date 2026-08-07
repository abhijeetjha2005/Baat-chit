import React, { useRef, useEffect, useState } from "react";
import Chatleft from "./Chatleft";
import Chatright from "./Chatright";

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);

const [socket, setSocket] = useState(null);

useEffect(() => {
  const ws = new WebSocket("ws://localhost:3000");

  ws.onopen = () => {
    console.log("WebSocket Connected");

  const user = JSON.parse(localStorage.getItem("user"));
  console.log("FULL USER:", user);

 const userId =
  user?._id ||
  user?.id ||
  user?.user?._id ||
  user?.user?.id;
  
  console.log("FINAL USER ID", userId);

  
    if (userId) {
     const registerPayload={
      type:"register",
      userId,
     }
     console.log("Sending register:",registerPayload);
     ws.send(JSON.stringify(registerPayload));
     
    }else{
      console.log("no user found");
      
    }


    setSocket(ws);
  };
    ws.onmessage = (event) => {
    console.log("WS message:", event.data);
  };
  ws.onclose = (event) => {
     console.log("WebSocket disconnected");
  console.log("Code:", event.code);
  console.log("Reason:", event.reason);
  console.log("Was clean:", event.wasClean);
  }
  ws.onerror=(error)=>{
     console.error("WebSocket error:", error);
  }

  return () => {
    ws.close();
  };
}, []);


  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  return (
    <div className="h-screen w-full bg-black overflow-hidden">
      {/* Removed inner borders so layout edges blend smoothly with your inner cards */}
      <div className="h-full w-full bg-zinc-900 flex flex-col md:flex-row overflow-hidden">

        {/* ==================== LEFT SIDEBAR (Contacts) ==================== */}
        {/* Changed 'hidden md:flex' to mirror the exact panel rules */}
        <div className={`w-full md:w-80 lg:w-96 md:border-r border-zinc-700/60 flex-shrink-0
                        ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
          <Chatleft 
            socket={socket}
            onChatSelect={setSelectedChat} 
            selectedChat={selectedChat}
            // Set this to true! On mobile (under md), the back button will hide/show correctly.
            showBackButton={!!selectedChat}
          />
        </div>

        {/* ==================== RIGHT CHAT AREA ==================== */}
        <div className={`flex-1 flex flex-col min-h-0 overflow-hidden
                        ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
          
          {selectedChat ? (
            <Chatright 
              socket={socket}
              selectedChat={selectedChat} 
             
              onBack={handleBackToList}
            />
          ) : (
            /* Empty State - Shown on desktop when no chat selected */
            <div className="hidden md:flex flex-1 items-center justify-center bg-zinc-900">
              <div className="text-center animate-fadeIn">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800/50 border border-zinc-700 flex items-center justify-center text-2xl">
                  💬
                </div>
                <p className="text-zinc-400 font-medium text-lg">Select a chat to start messaging</p>
                <p className="text-zinc-600 text-sm mt-1">Your conversations will appear here</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Chat;