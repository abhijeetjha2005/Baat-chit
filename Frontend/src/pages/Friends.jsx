import React, { useState, useEffect } from "react";


const Friends = ({ socket, 
  searchTerm = "", 
  onChatSelect, 
  selectedChat,
  onOpenSakha, 

}) => {
  console.log("Friends search:", searchTerm);
  const [friendsList, setFriendList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Retrieve actual user ID from localStorage
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const actualUserId = currentUser?._id || currentUser?.id;

  // Listen to incoming WebSocket messages safely
  useEffect(() => {
    if (!socket) return;

    // Fetch contacts when socket is ready or already open
    const fetchContacts = () => {
      setLoading(false);
      if (socket.readyState === WebSocket.OPEN && actualUserId) {
        socket.send(
          JSON.stringify({
            type: "fetch_contacts_list",
            userId: actualUserId,
          })
        );
      }
    };

    if (socket.readyState === WebSocket.OPEN) {
      fetchContacts();
    } else {
      socket.addEventListener("open", fetchContacts);
    }

    // Message event handler
    const handleMessage = (event) => {
      try {
        const incomingPayload = JSON.parse(event.data);

        switch (incomingPayload.type) {
          // Initial contacts list or search results
          case "contacts_list_add":
          case "search_results":
             console.log("Received in frontend:", incomingPayload.users);
            setFriendList(incomingPayload.users || []);
            setLoading(false);
            break;

          // Real-time Online/Offline Status Update
          case "user_status_change":
            setFriendList((prevFriends) =>
              prevFriends.map((friend) =>
                friend._id === incomingPayload.userId
                  ? { ...friend, status: incomingPayload.status }
                  : friend
              )
            );
            break;

         

          default:
            break;
        }
      } catch (err) {
        console.error("Error parsing WebSocket message frame:", err);
      }
    };

    socket.addEventListener("message", handleMessage);

    // CLEANUP: Detach event listeners without closing the shared socket connection
    return () => {
      socket.removeEventListener("open", fetchContacts);
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, actualUserId]);

  // Send search query to socket backend on search input
useEffect(() => {
  console.log("Search changed:", searchTerm);

  if (!socket || socket.readyState !== WebSocket.OPEN) return;

  if (searchTerm.trim() === "") {
    socket.send(
      JSON.stringify({
        type: "fetch_contacts_list",
      })
    );
  } else {
    socket.send(
      JSON.stringify({
        type: "search_users",
        query: searchTerm,
      })
    );
  }
}, [searchTerm, socket]);

  
  // Local search filter fallback
  const filteredFriends = friendsList.filter((friend) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = friend.name?.toLowerCase().includes(term);
    const emailMatch = friend.email?.toLowerCase().includes(term);
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
        {/* ai sakha */}
       <div
        onClick={onOpenSakha}
        className="flex items-center gap-3 p-3 rounded-2xl transition cursor-pointer hover:bg-purple-950/30 border border-purple-500/20 mb-2"
       >
          <div className="w-12 h-12 rounded-full bg-purple-950/50 
                  border border-purple-500/40 flex items-center 
                  justify-center text-2xl">
    🤖
  </div>
   <div className="flex-1 min-w-0">
    <h4 className="text-sm font-medium text-white">
      सखा
    </h4>
        <p className="text-xs text-purple-400 truncate">
      Your AI Assistant
    </p>
      </div>
       <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-pulse" />
       </div>

        {filteredFriends.length > 0 ? (
          filteredFriends.map((friend) => {
            const isSelected = selectedChat?._id === friend._id;
            const isOnline = friend.status?.toLowerCase() === "online";

            return (
              <div
                key={friend._id || friend.id}
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
                    alt={friend.name || "User"}
                    className="w-12 h-12 rounded-full bg-zinc-700"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-zinc-900 ${
                      isOnline ? "bg-emerald-500" : "bg-zinc-500"
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
    </div>
  );
};

export default Friends;