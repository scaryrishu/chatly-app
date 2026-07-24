import { useSocket } from "../context/SocketContext";
import React, { useState, useEffect, useRef } from "react";
import useChatStore from "../zustand/useChatStore";
import { useSelector } from "react-redux";

function ChatArea() {
  const { selectedUser, messages, fetchMessages, sendMessage } = useChatStore();
  const userData = useSelector((state) => state.user.userData);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  const { socket } = useSocket();

  // 1️⃣ Fetch messages when selected user changes
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // 2️⃣ Auto scroll to bottom when new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3️⃣ Listen for incoming socket messages — MOVED UP ✅
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        useChatStore.setState((state) => ({
          messages: [...state.messages, newMessage],
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser]);

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessage(selectedUser._id, text);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  // ✅ Early return now comes AFTER all hooks
  if (!selectedUser) {
    return (
      <div className="flex-1 h-full bg-slate-100 flex items-center justify-center">
        <p className="text-gray-400 text-xl">
          👈 Select a user to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col">
      {/* Chat Header */}
      <div className="w-full h-17.5 bg-[#20c7ff] flex items-center px-4 gap-3">
        {/* Back button - mobile only */}
        <button
          onClick={() => useChatStore.setState({ selectedUser: null })}
          className="md:hidden text-white text-xl"
        >
          ←
        </button>

        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#20c7ff] font-bold text-lg">
          {selectedUser.userName?.[0]?.toUpperCase()}
        </div>
        <p className="text-white font-bold text-lg">{selectedUser.userName}</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-100 flex flex-col gap-2">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 mt-10">
            No messages yet. Say hi! 👋
          </p>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === userData?._id;

          return (
            <div
              key={msg._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`
                max-w-[70%] px-4 py-2 rounded-2xl text-sm
                ${
                  isMe
                    ? "bg-[#20c7ff] text-white rounded-br-none"
                    : "bg-white text-gray-700 rounded-bl-none shadow-sm"
                }
              `}
              >
                <p>{msg.message}</p>
                <p
                  className={`text-[10px] mt-1 ${isMe ? "text-blue-100" : "text-gray-400"}`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Message Input */}
      <div className="w-full h-17.5 bg-white border-t-2 border-gray-200 flex items-center px-4 gap-3">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 h-11.25 outline-none border-2 border-[#20c7ff] rounded-full px-4 text-gray-700"
        />
        <button
          onClick={handleSend}
          className="w-11.25 h-11.25 bg-[#20c7ff] rounded-full flex items-center justify-center text-white text-xl hover:opacity-80"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default ChatArea;
