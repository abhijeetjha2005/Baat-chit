import React, { useState } from 'react';
import Friends from '../pages/Friends';
import { Search, ArrowLeft } from 'lucide-react';

const ChatLeft = ({ onChatSelect, selectedChat, showBackButton = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="h-full w-full flex flex-col bg-zinc-900">
      <div className="flex-1 flex flex-col bg-zinc-800 rounded-2xl md:rounded-3xl border border-zinc-700 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-zinc-700 flex items-center gap-3">
          {/* Back Button (Mobile Only - now switches perfectly at md breakpoint) */}
          {showBackButton && (
            <button 
              onClick={() => onChatSelect && onChatSelect(null)}
              className="md:hidden p-2 hover:bg-zinc-700 rounded-xl text-zinc-400 -ml-1 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          )}

          <h2 className="text-lg font-semibold text-white shrink-0">Chats</h2>
          
          <div className="relative flex-1">
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

            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search
                size={20}
                className={`text-zinc-400 transition-all duration-300 ${
                  isFocused ? "text-emerald-400 scale-110" : ""
                }`}
              />
            </div>
          </div>
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