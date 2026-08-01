import React, { useRef, useState, useEffect } from "react";
import {
  Send,
  Camera,
  Mic,
  FolderOpen,
  Edit2,
  MoreVertical,
  ArrowLeft,
} from "lucide-react";

const ChatRight = ({ socket, selectedChat, onBack }) => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const profileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem("user"));
const currentUserId = currentUser?._id || currentUser?.id; 


  // Who is selected
  //  Their name
  //  Their avatar
  //  Their ID

  const profileName = selectedChat?.name || "Unkown user";
  const profilePic =
    selectedChat?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profileName)}`;

  const receiverId = selectedChat?._id;
  console.log("Receiver ID:", selectedChat?._id);

  // 1. Message State Management
  const [messages, setMessages] = useState([]);
  // 2. Auto-grow Textarea Height Effect
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set to content height
    }
  }, [message]);

  // 3. Auto-scroll to Bottom Effect
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // receiving message
useEffect(() => {
  if (!socket || !selectedChat || !currentUserId) return;

  const handleMessage = (event) => {
    const data = JSON.parse(event.data);

   console.log("ChatRight received:", data);
console.log("My ID:", currentUserId);
console.log("Receiver ID in message:", data.receiverId);

      if (
    data.type === "receive_message" &&
    data.receiverId?.toString() === currentUserId?.toString()
  )

    {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: data.text,
          sender: "friend",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }
  };

  socket.addEventListener("message", handleMessage);

  return () => {
    socket.removeEventListener("message", handleMessage);
  };
}, [socket, selectedChat, currentUserId]);

  const handleFolderClick = () => fileInputRef.current?.click();
  const handleCameraClick = () => cameraInputRef.current?.click();

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files?.length > 0) console.log("Files selected:", files);
    e.target.value = "";
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }
    }

    const handleProfilePicChange = (e) => {
      console.log("Profile picture upload will be implemented later.");
    };

    e.target.value = "";
  };

 const handleSend = () => {

  console.log("Send clicked");
  console.log("socket:", socket);
  console.log("selectedChat:", selectedChat);

  if (!message.trim() || !selectedChat || !socket) return;

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const senderId = currentUser?._id || currentUser?.id;

  const payload = {
    type: "send_message",
    senderId: senderId,
    receiverId: selectedChat._id,
    text: message.trim(),
  };

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }else {
  console.log("Socket is not open", socket.readyState);
}

  const newMessage = {
    id: Date.now(),
    text: message.trim(),
    sender: "me",
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  setMessages((prev) => [...prev, newMessage]);
  setMessage("");
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMoreClick = () => {
    console.log("More options clicked");
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-700 bg-zinc-800 shrink-0">
        {/* Back Button - Visible only on mobile */}
        <button
          onClick={onBack}
          className="lg:hidden p-2 hover:bg-zinc-700 rounded-xl text-zinc-400"
        >
          <ArrowLeft size={24} />
        </button>

        <div
          className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-600 cursor-pointer group shrink-0"
          onClick={() => profileInputRef.current?.click()}
        >
          <img
            src={profilePic}
            alt="Profile"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
            <Edit2 size={18} className="text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-zinc-100 font-medium truncate">
            {profileName}
          </div>
          <div className="text-emerald-500 text-sm flex items-center gap-1.5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            Online
          </div>
        </div>

        <button
          onClick={handleMoreClick}
          className="p-2 hover:bg-zinc-700 rounded-xl text-zinc-400"
        >
          <MoreVertical size={22} />
        </button>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-zinc-900 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
            Start of conversation with {profileName}
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === "me";

            return (
              <div
                key={msg.id}
                className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%], md:max-w-[60%] rounded-2xl px-4 py-2 text-[15px] shadow-md relative tracking-wide leading-relaxed break-words whitespace-pre-wrap pb-5 ${
                    isMe
                      ? "bg-emerald-600 text-white rounded-tr-none"
                      : "bg-zinc-800 text-zinc-100 border border-zinc-700/50 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                  <span
                    className={`absolute bottom-0.5 right-3 text-[10px] select-none ${
                      isMe ? "text-emerald-200" : "text-zinc-500"
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })
        )}
        {/* Invisible anchor tag for scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-zinc-900 border-t border-zinc-700 shrink-0">
        <div className="w-full bg-zinc-800 rounded-3xl border border-zinc-700 shadow-lg p-3">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileChange}
          />
          <input
            type="file"
            ref={cameraInputRef}
            className="hidden"
            accept="image/*,video/*"
            capture="environment"
            onChange={handleFileChange}
          />
          <input
            type="file"
            ref={profileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleProfilePicChange}
          />

          <div className="flex items-end gap-3 bg-zinc-900 rounded-2xl border border-zinc-700/50 focus-within:border-emerald-500 p-3">
            <div className="flex gap-1 text-zinc-400">
              <button
                onClick={handleFolderClick}
                className="p-3 hover:bg-zinc-800 rounded-xl"
                title="Attach"
              >
                <FolderOpen size={26} />
              </button>
              <button
                onClick={handleCameraClick}
                className="p-3 hover:bg-zinc-800 rounded-xl hidden xs:block"
                title="Camera"
              >
                <Camera size={26} />
              </button>
              <button
                className="p-3 hover:bg-zinc-800 rounded-xl"
                title="Voice"
              >
                <Mic size={26} />
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows="1"
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 text-[17px] resize-none max-h-32 py-3 focus:outline-none custom-scrollbar"
            />

            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="p-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 disabled:text-zinc-400 text-zinc-900 rounded-2xl transition-all active:scale-95"
            >
              <Send size={26} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRight;
