import React, { useState, useEffect } from "react";
import Ai from "../components/Ai";

const Friends = () => {
  const [friendsList, setFriendList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredFriends = friendsList.filter(
    (friend) =>
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
      {/* Heading */}
      <h2 className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
        Friends
      </h2>

      {/* Search */}
      <div className="px-4 pb-3">
        <input
          type="text"
          placeholder="Search friends..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-2">
        {filteredFriends.length > 0 ? (
          filteredFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 transition cursor-pointer"
            >
              <div className="relative">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                    friend.name
                  )}`}
                  alt={friend.name}
                  className="w-11 h-11 rounded-full bg-zinc-700"
                />

                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 ${
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

                <p className="text-xs text-zinc-400 truncate">
                  {friend.email}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-zinc-500 mt-8">
            No friends found.
          </p>
        )}
      </div>

      {/* AI Button */}
      <div className="absolute bottom-5 right-5">
        <Ai />
      </div>
    </div>
  );
};

export default Friends;