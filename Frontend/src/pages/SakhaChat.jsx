import React, { useState } from "react";
import { Send ,
  ArrowLeft
} from "lucide-react";

const SakhaChat = ({onBack}) => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Sakha. How can I help you today?",
      sender: "ai",
    },
  ]);

const handleSend = async () => {
  if (!message.trim()) return;

  const userText = message.trim();

  const newMessage = {
    id: Date.now(),
    text: userText,
    sender: "user",
  };

  setMessages((prev) => [...prev, newMessage]);
  setMessage("");
setIsLoading(true);
  try {
    const response = await fetch("http://localhost:3000/api/sakha", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userText,
      }),
    });

    const data = await response.json();

    console.log("SAKHA RESPONSE:", data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to get AI response");
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        text: data.reply,
        sender: "ai",
      },
    ]);
  } catch (error) {
    console.error("SAKHA ERROR:", error);
  }
  finally {
  setIsLoading(false);
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
        <h2 className="text-white text-lg sm:text-xl font-semibold">
          🤖 सखा AI
        </h2>
          <p className="text-zinc-400 text-xs sm:text-sm">
          Your AI companion
        </p>

      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex mb-3 ${
              msg.sender === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[70%] px-3 py-2 rounded-2xl break-words ${
                msg.sender === "user"
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-800 text-white"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
  <div className="flex justify-start mb-3">
    <div className="bg-zinc-800 text-zinc-400 px-4 py-2 rounded-2xl">
      Thinking...
    </div>
  </div>
)}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 p-3 sm:p-4 border-t border-zinc-700 flex-shrink-0">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows="1"
          placeholder="Ask Sakha something..."
          className="flex-1 min-w-0 bg-transparent text-zinc-100 placeholder-zinc-500 text-[16px] sm:text-[17px] resize-none max-h-32 py-3 focus:outline-none"
        />

        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="flex-shrink-0 p-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 disabled:text-zinc-400 text-zinc-900 rounded-2xl transition-all active:scale-95"
        >
        <Send size={26} />
        </button>
      </div>

    </div>
  );
};

export default SakhaChat;