import React, { useState } from 'react';
import Friends from '../pages/Friends';
import { Search, ArrowLeft, X } from 'lucide-react';

const ChatLeft = ({ onChatSelect, selectedChat, showBackButton = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Triggered when user clicks the search icon or presses Enter
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    console.log("Searching for:", searchTerm);
    // Any extra search trigger logic can go here
  };

  // Clear search field
  const handleClear = () => {
    setSearchTerm("");
  };

  return (
    <div className="h-full w-full flex flex-col bg-zinc-900">
      <div className="flex-1 flex flex-col bg-zinc-800 rounded-2xl md:rounded-3xl border border-zinc-700 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-zinc-700 flex items-center gap-3">
          {/* Back Button (Mobile) */}
          {showBackButton && (
            <button 
              onClick={() => onChatSelect && onChatSelect(null)}
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

            {/* Clear Button (Shown when typing) or Search Button */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 text-zinc-500 hover:text-zinc-300 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              )}

              <button
                type="submit"
                className="p-1 text-zinc-400 hover:text-emerald-400 transition-all duration-300 focus:outline-none"
              >
                <Search
                  size={20}
                  className={`${
                    isFocused || searchTerm ? "text-emerald-400 scale-110" : "text-zinc-400"
                  }`}
                />
              </button>
            </div>
          </form>
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-hidden min-h-0">
          <Friends 
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