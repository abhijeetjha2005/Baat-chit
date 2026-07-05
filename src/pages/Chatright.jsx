import React, { useRef, useState } from "react";
import { Send, Camera, Mic, FolderOpen } from 'lucide-react';

const ChatRight = () => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [message, setMessage] = useState('');

  const handleFolderClick = () => fileInputRef.current?.click();
  const handleCameraClick = () => cameraInputRef.current?.click();

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log("Fetched files:", files);
    }
    e.target.value = '';
  };

  const handleSend = () => {
    if (message.trim()) {
      console.log("Message sent:", message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full p-2 sm:p-3 md:p-4 bg-zinc-900 flex items-end">
      <div className="w-full bg-zinc-800 rounded-2xl md:rounded-3xl border border-zinc-700 shadow-lg p-2 sm:p-3">
        
        {/* Hidden File Inputs */}
        <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
        <input 
          type="file" 
          ref={cameraInputRef} 
          className="hidden" 
          accept="image/*,video/*" 
          capture="environment" 
          onChange={handleFileChange} 
        />

        {/* Main Input Bar */}
        <div className="flex items-end gap-2 sm:gap-3 bg-zinc-900 rounded-2xl border border-zinc-700/50 focus-within:border-emerald-500 p-2 sm:p-3 transition-all">
          
          {/* Attachment Buttons */}
          <div className="flex items-center gap-1 text-zinc-400">
            <button
              type="button"
              onClick={handleFolderClick}
              className="p-3 hover:bg-zinc-800 hover:text-white rounded-xl transition-all active:scale-95"
              title="Attach"
            >
              <FolderOpen size={24} />
            </button>

            <button
              type="button"
              onClick={handleCameraClick}
              className="p-3 hover:bg-zinc-800 hover:text-white rounded-xl transition-all active:scale-95 hidden xs:block"
              title="Camera"
            >
              <Camera size={24} />
            </button>

            <button
              type="button"
              className="p-3 hover:bg-zinc-800 hover:text-white rounded-xl transition-all active:scale-95"
              title="Voice"
            >
              <Mic size={24} />
            </button>
          </div>

          {/* Textarea */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows="1"
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-zinc-200 placeholder-zinc-500 
                       text-base sm:text-sm resize-none max-h-36 py-3 px-3 
                       focus:outline-none leading-relaxed"
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="p-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 
                       disabled:cursor-not-allowed text-white rounded-2xl 
                       transition-all active:scale-95 flex-shrink-0"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRight;