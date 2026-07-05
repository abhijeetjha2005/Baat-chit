import React from "react";
import Chatleft from "./Chatleft";
import Chatright from "./Chatright";

const Chat = () => {
  return (
    <div className="h-screen w-full bg-black p-2 md:p-5">
      <div className="h-full w-full bg-zinc-900 rounded-2xl md:rounded-3xl shadow-2xl border border-zinc-700 overflow-hidden flex flex-col md:flex-row">

        {/* Sidebar */}
        <div className="w-full h-72 md:h-full md:w-1/3 lg:w-1/4 border-b md:border-b-0 md:border-r border-zinc-700">
          <Chatleft />
        </div>

        {/* Chat Area */}
        <div className="flex-1">
          <Chatright />
        </div>

      </div>
    </div>
  );
};

export default Chat;