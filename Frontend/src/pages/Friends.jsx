import React, { useState, useEffect } from "react";
import Ai from "../components/Ai";

const Friends = ({ searchTerm }) => {
  const [friendsList, setFriendList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchedUsers = [
      {
        id: "u1",
        name: "Sarah Connor",
        email: "sarah@gmail.com",
        phone: "+123456",
        status: "Online",
      },
      {
        id: "u2",
        name: "John Doe",
        email: "john@gmail.com",
        phone: "+987654",
        status: "Offline",
      },
    ];

    setFriendList(fetchedUsers);
    setLoading(false);
  }, []);

  // Filter friends based on search term (from Chatleft)
  const filteredFriends = friendsList.filter((friend) =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          filteredFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-800/70 active:bg-zinc-800 transition cursor-pointer"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                    friend.name
                  )}`}
                  alt={friend.name}
                  className="w-12 h-12 rounded-full bg-zinc-700"
                />
                <span
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-zinc-900 ${
                    friend.status === "Online" ? "bg-emerald-500" : "bg-zinc-500"
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white truncate">
                  {friend.name}
                </h4>
                <p className="text-xs text-zinc-400 truncate">
                  {friend.email}
                </p>
              </div>
            </div>
          ))
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