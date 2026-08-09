import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
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
  const [messages, setMessages] = useState([]);
  const [showMenu,setShowMenu] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  // 1. Get logged-in user and normalize ID
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return {};
    }
  }, []);

  const currentUserId = (currentUser?._id || currentUser?.id)?.toString();

  // 2. Extract Receiver ID cleanly (handles all object variations)
  const receiverId = (
    selectedChat?._id ||
    selectedChat?.id ||
    selectedChat?.user?._id
  )?.toString();

  const profileName =
    selectedChat?.name || selectedChat?.user?.name || "Unknown user";
  const profilePic =
    selectedChat?.profilePic ||
    selectedChat?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      profileName,
    )}`;

  console.log("ChatRight Active Context:", {
    currentUserId,
    receiverId,
    profileName,
  });

  // Auto-scroll helper
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  // 3. Fetch Message History on active chat change
  useEffect(() => {
    if (!socket || !receiverId || !currentUserId) {
      return;
    }

    const payload = {
      type: "fetch_messages",
      senderId: currentUserId,
      receiverId: receiverId,
    };

    console.log("fetching old messages:", payload);

    socket.send(JSON.stringify(payload));
  }, [socket, selectedChat]);
  // 4. Auto-scroll when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 5. Auto-grow Textarea Height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // 6. Listen for incoming Real-Time WebSocket Messages
  useEffect(() => {
    if (!socket || !receiverId) return;

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("ChatRight received WS event:", data);
        if (data.type === "old_messages") {
   
          if(data.conversationId){
           setActiveConversationId(data.conversationId)
          }
 
          const formattedMessages = data.messages.map((msg) => {
            const senderId = (msg.sender?._id || msg.sender).toString();

            return {
              id: msg._id,
              text: msg.text,
              sender: senderId === currentUserId ? "me" : "friend",

              time: new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
          });

          setMessages(formattedMessages);
          return;

        }
        
        // Match typical real-time message types
        if (
          data.type === "receive_message"
        ) {
          const msg = data.message || data;
          const msgSenderId = (
            msg.senderId ||
            msg.sender?._id ||
            msg.sender
          )?.toString();

          // Only append if the message is from the user we are currently chatting with
          if (msgSenderId === receiverId) {
            setMessages((prev) => [
              ...prev,
              {
                id: msg._id || Date.now(),
                text: msg.text || msg.content || "",
                sender: "friend",
                time: new Date(msg.createdAt || Date.now()).toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                ),
              },
            ]);
          }
        }

      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, receiverId]);

  // 7. Handle Sending Messages
  const handleSend = () => {
    if (!message.trim()) return;

    if (!receiverId) {
      console.error("Cannot send message: No selected user receiver ID found!");
      alert("Please select a user to send a message.");
      return;
    }

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error(
        "Cannot send message: WebSocket is not open!",
        socket?.readyState,
      );
      alert("WebSocket connection is disconnected.");
      return;
    }

    const trimmedText = message.trim();

    const payload = {
      type: "send_message",
      senderId: currentUserId,
      receiverId: receiverId,
      text: trimmedText,
    };

    console.log("Sending message WS payload:", payload);
    socket.send(JSON.stringify(payload));

    // Optimistic local state update
    const newMessage = {
      id: Date.now(),
      text: trimmedText,
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
  };
  // delete logic
 const handleDelete = async () => {
  const conversationId = activeConversationId;

  if (!conversationId) {
    console.log("No conversation id found");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    console.log("TOKEN EXISTS:", !!token);
    console.log("CONVERSATION ID:", conversationId);

    const res = await fetch(
      `http://localhost:3000/api/chat/conversation/${conversationId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    console.log("DELETE STATUS:", res.status);
    console.log("DELETE RESPONSE:", data);

    if (res.ok) {
      setMessages([]);
      setActiveConversationId(null);
      setShowMenu(false);
    }

  } catch (error) {
    console.log("Delete error:", error);
  }
};
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-700 bg-zinc-800 shrink-0">
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
{/* deletion */}
      <div className="relative">
   <button
    onClick={()=>setShowMenu((prev)=>!prev)}
    className="p-2 hover:bg-zinc-700 rounded-xl text-zinc-400"
   >
    <MoreVertical size={22}/>

   </button>
   {showMenu&&(
    <div className="absolute right-0 top-12 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg w-40 z-50">
      <button 
       onClick={handleDelete}
        className="w-full text-left px-4 py-3 text-red-400 hover:bg-zinc-700 rounded-lg">
  Delete Chat
  
      </button>
    </div>
   )}

      </div>
      </div>

      {/* Messages Display */}
      <div className="flex-1 overflow-y-auto p-4 bg-zinc-900 space-y-3">
        {!receiverId ? (
          <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
            Select a contact to start chatting
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
            Start of conversation with {profileName}
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === "me";

            return (
              <div
                key={msg.id}
                className={`flex w-full ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-2 text-[15px] shadow-md relative tracking-wide leading-relaxed break-words whitespace-pre-wrap pb-5 ${
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-zinc-900 border-t border-zinc-700 shrink-0">
        <div className="w-full bg-zinc-800 rounded-3xl border border-zinc-700 shadow-lg p-3">
          <input type="file" ref={fileInputRef} className="hidden" multiple />
          <input
            type="file"
            ref={cameraInputRef}
            className="hidden"
            accept="image/*"
          />
          <input
            type="file"
            ref={profileInputRef}
            className="hidden"
            accept="image/*"
          />

          <div className="flex items-end gap-3 bg-zinc-900 rounded-2xl border border-zinc-700/50 focus-within:border-emerald-500 p-3">
            <div className="flex gap-1 text-zinc-400">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 hover:bg-zinc-800 rounded-xl"
                title="Attach"
              >
                <FolderOpen size={26} />
              </button>
              <button
                onClick={() => cameraInputRef.current?.click()}
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
