import React, { useState } from "react";
import Chatleft from "./Chatleft";
import Chatright from "./Chatright";

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  return (
    <div className="h-screen w-full bg-black overflow-hidden">
      <div className="h-full w-full bg-zinc-900 flex flex-col md:flex-row border border-zinc-700">

        {/* ==================== LEFT SIDEBAR (Contacts) ==================== */}
        <div className={`w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-zinc-700 flex-shrink-0
                        ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
          <Chatleft 
            onChatSelect={handleChatSelect} 
            selectedChat={selectedChat}
            showBackButton={false}
          />
        </div>

        {/* ==================== RIGHT CHAT AREA ==================== */}
        <div className={`flex-1 flex flex-col min-h-0 overflow-hidden
                        ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
          
          {selectedChat ? (
            <Chatright 
              profileName={selectedChat.name} 
              profilePic={selectedChat.avatar} 
              onBack={handleBackToList}
            />
          ) : (
            /* Empty State - Shown on desktop when no chat selected */
            <div className="hidden md:flex flex-1 items-center justify-center bg-zinc-900">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                  💬
                </div>
                <p className="text-zinc-500 text-lg">Select a chat to start messaging</p>
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