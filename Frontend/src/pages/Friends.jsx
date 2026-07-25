import React, { useState, useEffect, useRef } from "react";
import Ai from "../components/Ai";

const Friends = ({ searchTerm = "", onChatSelect, selectedChat }) => {
  const [friendsList, setFriendList] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    // 1. Establish a native WebSocket bridge connection straight to your backend port
    const socketUrl = "ws://localhost:3000";
    console.log(`Attempting to connect to backend socket at: ${socketUrl}`);

    const ws = new WebSocket(socketUrl);
    socketRef.current = ws;

    // 2. CONNECTION OPEN
    ws.onopen = () => {
      console.log("Connected to backend successfully!");
      setLoading(false);
      
      // Request initial contacts list
      ws.send(
        JSON.stringify({
          type: "fetch_contacts_list",
          userId: "current_logged_in_user_id",
        })
      );
    };

    // 3. MESSAGE RECEIVED
  ws.onmessage = (event) => {
  try {
    const incomingPayload = JSON.parse(event.data);

    // Initial contacts list
    if (incomingPayload.type === "contacts_list_add") {
      setFriendList(incomingPayload.users || []);
    }

    // 🟢 Real-time Online/Offline Status Update
    if (incomingPayload.type === "user_status_change") {
      setFriendList((prevFriends) =>
        prevFriends.map((friend) =>
          friend._id === incomingPayload.userId
            ? { ...friend, status: incomingPayload.status }
            : friend
        )
      );
    }
  } catch (err) {
    console.error("Error parsing socket payload message frame:", err);
  }
} ;
    // 4. CONNECTION ERROR/CLOSE
    ws.onerror = (err) => {
      console.error("WebSocket connection error occurred:", err);
    };
    
    ws.onclose = () => {
      console.warn("WebSocket connection closed by host network layer.");
    };

    // CLEANUP
    return () => {
      if (ws) { 
        ws.close();
      }
    };
  }, []);

  // Send search query to socket backend whenever user explicitly triggers search
  useEffect(() => {
    if (searchTerm.trim() && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "search_users",
          query: searchTerm,
        })
      );
    }
  }, [searchTerm]);

  // Local filter fallback for fast instant typing feedback
  const filteredFriends = friendsList.filter((friend) => {
    const nameMatch = friend.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = friend.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || emailMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400">
        Loading contacts...
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full">
      {/* Friends List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scroll">
        {filteredFriends.length > 0 ? (
          filteredFriends.map((friend) => {
            const isSelected = selectedChat?._id === friend._id;

            return (
              <div
                key={friend._id}
                onClick={() => onChatSelect && onChatSelect(friend)}
                className={`flex items-center gap-3 p-3 rounded-2xl transition cursor-pointer ${
                  isSelected 
                    ? "bg-zinc-700/80 border border-emerald-500/30" 
                    : "hover:bg-zinc-800/70 active:bg-zinc-800"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                      friend.name || "User"
                    )}`}
                    alt={friend.name}
                    className="w-12 h-12 rounded-full bg-zinc-700"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-zinc-900 ${
                      friend.status === "Online"
                        ? "bg-emerald-500"
                        : "bg-zinc-500"
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate">
                    {friend.name}
                  </h4>
                  <p className="text-xs text-zinc-400 truncate">{friend.email}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-10">
            <p>No friends found</p>
          </div>
        )}
      </div>

      {/* Floating AI Button */}
      <div className="absolute bottom-6 right-6 z-10">
        <Ai />
      </div>
    </div>
  );
};

export default Friends;
