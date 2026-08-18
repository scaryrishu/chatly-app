import { useSocket } from "../context/SocketContext";
import React, { useState, useEffect, useRef } from "react";
import useChatStore from "../zustand/useChatStore";
import { useSelector } from "react-redux";
import { Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

function ChatArea() {
  const { selectedUser, messages, fetchMessages, sendMessage, setSelectedUser } = useChatStore();
  const userData = useSelector((state) => state.user.userData);
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiRef = useRef(null);
  const bottomRef = useRef(null);
  const { socket } = useSocket();

  // 1️⃣ Fetch messages when selected user changes
  // (this also marks them as seen on the backend, which clears the sidebar badge)
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // 2️⃣ Auto scroll to bottom when new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close the emoji picker whenever you switch chats
  useEffect(() => {
    setShowEmojiPicker(false);
  }, [selectedUser]);

  // Close the emoji picker on an outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Note: incoming real-time messages are no longer handled here.
  // SocketContext listens globally and calls useChatStore's receiveMessage(),
  // which appends to `messages` when this chat is open, or bumps the
  // sidebar's unread badge when it isn't — so this component just reads
  // whatever's already in the store.

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessage(selectedUser._id, text);
    setText("");
    setShowEmojiPicker(false);   // ← add this line
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  // ✅ Early return now comes AFTER all hooks
  if (!selectedUser) {
    return (
      <div className="flex-1 h-full bg-[#0d1117] flex items-center justify-center relative overflow-hidden">
        {/* Breathing background glow */}
        <div className="absolute w-56 h-56 bg-[#20c7ff]/10 rounded-full blur-3xl animate-[pulseGlow_4s_ease-in-out_infinite]" />

        <div className="relative text-center px-6 animate-[fadeInUp_0.7s_ease-out]">
          {/* Welcome Text */}
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-['Space_Grotesk',sans-serif]">
            Welcome to{" "}
            <span className="text-[#20c7ff] drop-shadow-[0_0_12px_rgba(32,199,255,0.4)] inline-block animate-[popIn_0.6s_ease-out_0.2s_both]">
              Chatly
            </span>{" "}
            <span className="text-zinc-400 font-light">:)</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-3 text-base md:text-lg text-zinc-400 font-medium tracking-wide font-['Space_Grotesk',sans-serif] animate-[fadeInUp_0.7s_ease-out_0.3s_both]">
            Your conversations,{" "}
            <span className="text-zinc-200 font-semibold">all in one place.</span>
          </p>

          {/* Select User */}
          <div className="mt-6 flex items-center justify-center gap-2 animate-[fadeInUp_0.7s_ease-out_0.5s_both]">
            <span className="text-xl animate-bounce">👈</span>
            <p className="text-sm md:text-base text-zinc-500 font-mono">
              Select a user to start chatting...
            </p>
          </div>
        </div>

        <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.85); }
          70%  { transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.15); }
        }
        @keyframes shimmerLine {
          0%, 100% { opacity: 0.3; }
          50%      { opacity: 1; }
        }
      `}</style>
      </div>
    );
  }

  // Prefer the display name; fall back to username until one is set.
  // Same fallback drives the avatar initial so it always matches
  // whatever text is actually being shown.
  const displayName = selectedUser.name || selectedUser.userName;

  return (
    <div className="flex-1 h-full flex flex-col bg-[#0d1117]">
      {/* Chat Header */}
      <div className="w-full h-17.5 bg-[#161b22] border-b border-white/5 flex items-center px-4 gap-3 shrink-0">
        {/* Back button - mobile only */}
        <button
          onClick={() => setSelectedUser(null)}
          className="md:hidden text-zinc-300 text-xl"
        >
          ←
        </button>

        <div className="w-10 h-10 rounded-full bg-[#20c7ff]/15 border border-[#20c7ff]/30 flex items-center justify-center text-[#20c7ff] font-bold text-lg overflow-hidden shrink-0">
          {selectedUser.image ? (
            <img src={selectedUser.image} className="w-full h-full object-cover" alt="" />
          ) : (
            displayName?.[0]?.toUpperCase()
          )}
        </div>
        <div className="flex flex-col justify-center leading-tight">
          <p className="text-zinc-100 font-semibold text-base">{displayName}</p>
          <p className="text-zinc-500 text-xs">{selectedUser.email}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#0d1117] flex flex-col gap-2
          [scrollbar-width:thin]
          [scrollbar-color:rgba(255,255,255,0.18)_transparent]
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-white/15
          hover:[&::-webkit-scrollbar-thumb]:bg-white/35">
        {messages.length === 0 && (
          <p className="text-center text-zinc-500 mt-10">
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
                ${isMe
                    ? "bg-[#20c7ff] text-white rounded-br-none"
                    : "bg-[#1c2230] text-zinc-200 rounded-bl-none border border-white/5"
                  }
              `}
              >
                <p>{msg.message}</p>
                <p
                  className={`text-[10px] mt-1 ${isMe ? "text-blue-100" : "text-zinc-500"}`}
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
      <div className="w-full h-17.5 bg-[#161b22] border-t border-white/5 flex items-center px-4 gap-3 shrink-0 relative">
        <div ref={emojiRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-400 hover:text-[#20c7ff] hover:bg-white/5 transition"
          >
            <Smile size={22} />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-14 left-0 z-50 shadow-2xl shadow-black/50 rounded-xl overflow-hidden">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme="dark"
                autoFocusSearch={false}
                lazyLoadEmojis
                previewConfig={{ showPreview: false }}
                height={380}
                width={320}
              />
            </div>
          )}
        </div>

        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 h-11.25 outline-none border-2 border-white/10 focus:border-[#20c7ff]/60 rounded-full px-4 bg-[#0d1117] text-zinc-200 placeholder-zinc-500 transition"
        />
        <button
          onClick={handleSend}
          className="w-11.25 h-11.25 bg-[#20c7ff] rounded-full flex items-center justify-center text-white text-xl hover:opacity-80 transition shrink-0"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default ChatArea;