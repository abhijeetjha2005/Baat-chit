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
  MoreVertical,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChatRight = ({ socket, selectedChat, onBack }) => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState(null);
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
          if (data.conversationId) {
            setActiveConversationId(data.conversationId);
          }

          const formattedMessages = data.messages.map((msg) => {
            const senderId = (msg.sender?._id || msg.sender).toString();

            return {
              id: msg._id,
              text: msg.text || "",
              audioUrl: msg.audioUrl || null,
              type: msg.messageType === "voice" ? "voice" : "text",
              sender: senderId === currentUserId ? "me" : "friend",

              time: new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
            };
          });

          setMessages(formattedMessages);
          return;
        }
        if (data.type === "message_deleted") {
          console.log("MESSAGE DELETED FROM WS:", data.messageId);

          setMessages((prev) =>
            prev.filter((msg) => msg.id !== data.messageId),
          );

          return;
        }

        if (data.type === "user_status_change") {
          console.log("STATUS EVENT:", {
            eventUserId: data.userId,
            receiverId,
            status: data.status,
            lastSeen: data.lastSeen,
          });

          if (data.userId?.toString() === receiverId?.toString()) {
            if (data.status === "online") {
              setIsOnline(true);
              setLastSeen(null);
            }

            if (data.status === "offline") {
              setIsOnline(false);
              setLastSeen(data.lastSeen || null);
            }
          }

          return;
        }
        if (data.type === "typing") {
          if (data.senderId?.toString() === receiverId?.toString()) {
            setIsTyping(data.isTyping);
          }

          return;
        }

        // Match typical real-time message types
        if (data.type === "receive_message") {
          const msg = data.message || data;
          const msgSenderId = (
            msg.senderId ||
            msg.sender?._id ||
            msg.sender
          )?.toString();

          // Only append if the message is from the user we are currently chatting with
          if (msgSenderId === receiverId || msgSenderId === currentUserId) {
            setMessages((prev) => [
              ...prev,
              {
                id: msg._id,
                text: msg.text || "",
                audioUrl: msg.audioUrl || null,
                type: msg.messageType,
                sender: msgSenderId === currentUserId ? "me" : "friend",
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

  const startRecording = async () => {
    console.log("START RECORDING CALLED");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        console.log("Audio chunk:", event.data.size);

        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        console.log("Total chunks:", audioChunksRef.current.length);

        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        console.log("Audio blob size:", audioBlob.size);
        console.log("Audio type:", audioBlob.type);

        const audioUrl = URL.createObjectURL(audioBlob);

        setRecordedAudio(audioUrl);

        stream.getTracks().forEach((track) => track.stop());

        clearInterval(recordingTimerRef.current);
      };

      recorder.start();

      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Microphone error:", error);

      alert("Cannot access microphone. Please allow microphone permission.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteRecordedAudio = () => {
    if (recordedAudio) {
      URL.revokeObjectURL(recordedAudio);
    }

    setRecordedAudio(null);
    setRecordingTime(0);
  };
  // typing

  const handleTyping = (e) => {
    console.log("TYPING FUNCTION CALLED:", e.target.value);

    const value = e.target.value;

    setMessage(value);

    if (!socket || socket.readyState !== WebSocket.OPEN || !receiverId) {
      return;
    }
    console.log("SENDING TYPING:", {
      senderId: currentUserId,
      receiverId: receiverId,
      isTyping: true,
      socketState: socket.readyState,
    });
    // Tell receiver that we are typing
    socket.send(
      JSON.stringify({
        type: "typing",
        senderId: currentUserId,
        receiverId: receiverId,
        isTyping: true,
      }),
    );

    // Clear previous timer
    clearTimeout(typingTimeoutRef.current);

    // After 1 second of no typing
    typingTimeoutRef.current = setTimeout(() => {
      socket.send(
        JSON.stringify({
          type: "typing",
          senderId: currentUserId,
          receiverId: receiverId,
          isTyping: false,
        }),
      );
    }, 1000);
  };

  // 7. Handle Sending Messages
  const handleSend = async () => {
    if (!receiverId) {
      alert("Please select a user.");
      return;
    }

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      alert("WebSocket connection is disconnected.");
      return;
    }

    // AUDIO MESSAGE
    // AUDIO MESSAGE
    if (recordedAudio) {
      try {
        console.log("Sending audio:", recordedAudio);

        // 1. Convert local blob URL to Blob
        const response = await fetch(recordedAudio);
        // This creates the recorded audio file in memory.
        const audioBlob = await response.blob();

        console.log("Audio blob:", audioBlob);
        console.log("Audio type:", audioBlob.type);
        console.log("Audio size:", audioBlob.size);

        // 2. Upload audio to backend
        const formData = new FormData();

        formData.append("audio", audioBlob, "voice-message.webm");

        const uploadResponse = await fetch(
          "http://localhost:3000/api/upload/audio",
          {
            method: "POST",
            body: formData,
          },
        );

        const uploadData = await uploadResponse.json();
        if(!uploadResponse.ok){
          throw new Error(uploadData.message || "Audio upload failed")
        }
     const audioUrlFromServer=uploadData.audioUrl;

        console.log("UPLOAD STATUS:", uploadResponse.status);
        console.log("UPLOAD RESPONSE:", responseText);

        if (!uploadResponse.ok) {
          throw new Error(uploadData.message || "Audio upload failed");
        }

        console.log("SERVER AUDIO URL:", audioUrlFromServer);

        if (!audioUrlFromServer) {
          throw new Error("Backend did not return audioUrl");
        }

        // 4. Send audio message through WebSocket
        const payload = {
          type: "send_voice",
          senderId: currentUserId,
          receiverId: receiverId,
          audioUrl: audioUrlFromServer,
          messageType: "voice",
        };

        // console.log("SENDING AUDIO MESSAGE:", payload);

        socket.send(JSON.stringify(payload));

        // 5. Clear recorded audio
        URL.revokeObjectURL(recordedAudio);
        setRecordedAudio(null);
        setRecordingTime(0);

        return;
      } catch (error) {
        console.error("Audio sending error:", error);
      }
    }

    // TEXT MESSAGE
    if (!message.trim()) return;

    const payload = {
      type: "send_message",
      senderId: currentUserId,
      receiverId: receiverId,
      text: message.trim(),
    };

    socket.send(JSON.stringify(payload));

    setMessage("");
  };
  // delete logic
  const handleDelete = async (messageId) => {
    console.log("DELETE MESSAGE ID:", messageId);

    if (!messageId) {
      console.error("Invalid message ID:", messageId);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:3000/api/chat/message/${messageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await res.json();

      console.log("DELETE STATUS:", res.status);
      console.log("DELETE RESPONSE:", data);

      if (res.ok) {
        // Remove from current user's screen
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

        // Notify other user through WebSocket
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: "message_deleted",
              messageId: messageId,
              conversationId: activeConversationId,
            }),
          );
        }
      }
    } catch (error) {
      console.error("Delete message error:", error);
    }
  };

  const handleDeleteChat = async () => {
    if (!activeConversationId) {
      console.error("No active conversation ID");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:3000/api/chat/conversation/${activeConversationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      console.log("DELETE CHAT STATUS:", res.status);
      console.log("DELETE CHAT RESPONSE:", data);

      if (res.ok) {
        setMessages([]);
        setActiveConversationId(null);
        setShowMenu(false);

        onBack();
      } else {
        console.error("Delete chat failed:", data);
      }
    } catch (error) {
      console.error("Delete chat error:", error);
    }
  };

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (socket) {
      socket.close();
    }

    navigate("/login");
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // timer for recording
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${minutes}:${secs.toString().padStart(2, "0")}`;
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

        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-600 shrink-0">
          <img
            src={profilePic}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-zinc-100 font-medium truncate">
            {profileName}
          </div>
          <div className="text-sm flex items-center gap-1.5">
            {isTyping ? (
              <span className="text-emerald-400">Typing...</span>
            ) : isOnline ? (
              <>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-500">Online</span>
              </>
            ) : (
              <span className="text-zinc-500">
                {lastSeen
                  ? `Last seen ${new Date(lastSeen).toLocaleString([], {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}`
                  : "Offline"}
              </span>
            )}
          </div>
        </div>
        {/* deletion */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="p-2 hover:bg-zinc-700 rounded-xl text-zinc-400"
          >
            <MoreVertical size={22} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-12 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg w-40 z-50">
              <button
                onClick={handleDeleteChat}
                className="w-full text-left px-4 py-3 text-red-400 hover:bg-zinc-700 rounded-lg"
              >
                Delete Chat
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-zinc-200 hover:bg-zinc-700 rounded-lg"
              >
                Logout
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
                  className={`max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-2 text-[27px] shadow-md relative tracking-wide leading-relaxed break-words whitespace-pre-wrap pb-5 ${
                    isMe
                      ? "bg-emerald-600 text-white rounded-tr-none"
                      : "bg-zinc-800 text-zinc-100 border border-zinc-700/50 rounded-tl-none"
                  }`}
                >
                  {msg.type === "voice" ? (
                    <audio controls src={msg.audioUrl} className="max-w-full" />
                  ) : (
                    msg.text
                  )}

                  <span
                    className={`absolute bottom-0.5 right-1 text-[10px] select-none ${
                      isMe ? "text-emerald-200" : "text-zinc-500"
                    }`}
                  >
                    {msg.time}
                  </span>
                  {isMe && (
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="text-red-300 text-xs ml-3"
                    >
                      Unsend
                    </button>
                  )}
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
              {isRecording ? (
                <div className="flex items-center gap-3 flex-1 bg-zinc-900 rounded-xl px-3 py-2">
                  {/* Recording indicator */}
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />

                  {/* Recording text */}
                  <span className="text-red-400 font-medium">Recording</span>

                  {/* Timer */}
                  <span className="text-zinc-300 font-mono">
                    {formatTime(recordingTime)}
                  </span>

                  {/* Stop button */}
                  <button
                    onClick={stopRecording}
                    className="ml-auto p-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
                    title="Stop recording"
                  >
                    <div className="w-3 h-3 bg-white rounded-sm" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={startRecording}
                  className="p-3 hover:bg-zinc-800 rounded-xl"
                  title="Voice"
                >
                  <Mic size={26} />
                </button>
              )}
            </div>

            {recordedAudio && !isRecording && (
              <div className="mb-3 flex items-center gap-3 bg-zinc-900 border border-zinc-700 rounded-2xl p-3">
                <audio controls src={recordedAudio} className="flex-1" />

                <button
                  onClick={deleteRecordedAudio}
                  className="px-3 py-2 text-red-400 hover:bg-zinc-800 rounded-lg"
                >
                  ✕
                </button>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                console.log("TEXTAREA CHANGE:", e.target.value);
                handleTyping(e);
              }}
              onKeyDown={handleKeyDown}
              rows="1"
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 text-[17px] resize-none max-h-32 py-3 focus:outline-none custom-scrollbar"
            />

            <button
              onClick={handleSend}
              disabled={!message.trim() && !recordedAudio}
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
