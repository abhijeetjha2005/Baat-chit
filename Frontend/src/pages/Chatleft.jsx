import React, { useState } from 'react';
import Friends from './Friends';
import { Search, ArrowLeft, X } from 'lucide-react';

const ChatLeft = ({
  socket, 
  onChatSelect, 
  selectedChat,
  showBackButton = false 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Triggered when user submits search or presses Enter
 const handleSearch = (e) => {
  if (e) e.preventDefault();

  console.log("Search clicked:", searchTerm);

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.log("WebSocket is not connected");
    return;
  }

  if (!searchTerm.trim()) {
    console.log("Search is empty");
    return;
  }

  socket.send(
    JSON.stringify({
      type: "search_users",
      query: searchTerm.trim(),
    })
  );

  console.log("Search request sent");
};

  // Clear search field
  const handleClear = (e) => {
    e.preventDefault();
    setSearchTerm("");
  };
console.log("ChatLeft search:", searchTerm);
  return (
    <div className="h-full w-full flex flex-col bg-zinc-900 overflow-hidden">
      {/* ADDED: min-h-0 to allow internal flex children to calculate scroll heights */}
      <div className="flex-1 min-h-0 flex flex-col bg-zinc-800 rounded-2xl md:rounded-3xl border border-zinc-700 shadow-xl overflow-hidden">
        
        {/* Header (shrink-0 ensures it never squishes when list grows) */}
        <div className="p-3 sm:p-4 border-b border-zinc-700 flex items-center gap-3 shrink-0">
          {/* Back Button (Mobile) */}
          {showBackButton && (
            <button 
              onClick={() => onChatSelect && onChatSelect(null)}
              aria-label="Back to chat list"
              className="md:hidden p-2 hover:bg-zinc-700 rounded-xl text-zinc-400 -ml-1 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          )}

          <h2 className="text-lg font-semibold text-white shrink-0">Chats</h2>
          
          <form onSubmit={handleSearch} className="relative flex-1">
            <input
              type="text"
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl 
                         py-3.5 pl-5 pr-12 text-base sm:text-sm text-white 
                         placeholder-zinc-500 outline-none transition-all 
                         focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />

            {/* Actions Inside Input */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchTerm && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleClear}
                  aria-label="Clear search"
                  className="p-1 text-zinc-500 hover:text-zinc-300 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              )}

              <button
                type="submit"
                aria-label="Submit search"
                className="p-1 text-zinc-400 hover:text-emerald-400 transition-all duration-300 focus:outline-none"
              >
                <Search
                  size={20}
                  className={`transition-transform duration-200 ${
                    isFocused || searchTerm ? "text-emerald-400 scale-110" : "text-zinc-400"
                  }`}
                />
              </button>
            </div>
          </form>
        </div>

        {/* Friends List Container */}
        <div className="flex-1 overflow-hidden min-h-0">
          <Friends 
            socket={socket}
            searchTerm={searchTerm} 
            onChatSelect={onChatSelect} 
            selectedChat={selectedChat}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatLeft;