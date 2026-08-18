import { useSocket } from "../context/SocketContext";
import React, { useState, useEffect, useRef } from "react";
import useChatStore from "../zustand/useChatStore";
import { useSelector } from "react-redux";
import { Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

function ChatArea() {
  const {
    selectedUser,
    messages,
    fetchMessages,
    sendMessage,
    setSelectedUser,
  } = useChatStore();

  const userData = useSelector((state) => state.user.userData);

  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const emojiRef = useRef(null);
  const bottomRef = useRef(null);

  const { socket } = useSocket();

  // Fetch messages when selected user changes
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Close emoji picker when switching chats
  useEffect(() => {
    setShowEmojiPicker(false);
  }, [selectedUser]);

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiRef.current &&
        !emojiRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleSend = async () => {
    const message = text.trim();

    if (!message || !selectedUser || isSending) return;

    setText("");
    setIsSending(true);

    try {
      await sendMessage(selectedUser._id, message);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Failed to send message:", error);

      // Put message back if sending fails
      setText(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ---------------------------------------
  // NO USER SELECTED
  // ---------------------------------------

  if (!selectedUser) {
    return (
      <div className="flex-1 min-w-0 h-full bg-[#0d1117] flex items-center justify-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute w-40 h-40 sm:w-56 sm:h-56 bg-[#20c7ff]/10 rounded-full blur-3xl animate-[pulseGlow_4s_ease-in-out_infinite]" />

        <div className="relative text-center px-5 sm:px-6 animate-[fadeInUp_0.7s_ease-out]">
          {/* Welcome */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-['Space_Grotesk',sans-serif]">
            Welcome to{" "}
            <span className="text-[#20c7ff] drop-shadow-[0_0_12px_rgba(32,199,255,0.4)] inline-block animate-[popIn_0.6s_ease-out_0.2s_both]">
              Chatly
            </span>{" "}
            <span className="text-zinc-400 font-light">
              :)
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-3 text-sm sm:text-base md:text-lg text-zinc-400 font-medium tracking-wide font-['Space_Grotesk',sans-serif]">
            Your conversations,{" "}
            <span className="text-zinc-200 font-semibold">
              all in one place.
            </span>
          </p>

          {/* Select user */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="text-lg sm:text-xl animate-bounce">
              👈
            </span>

            <p className="text-xs sm:text-sm md:text-base text-zinc-500 font-mono">
              Select a user to start chatting...
            </p>
          </div>
        </div>

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes popIn {
            0% {
              opacity: 0;
              transform: scale(0.85);
            }

            70% {
              transform: scale(1.04);
            }

            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes pulseGlow {
            0%, 100% {
              opacity: 0.5;
              transform: scale(1);
            }

            50% {
              opacity: 1;
              transform: scale(1.15);
            }
          }
        `}</style>
      </div>
    );
  }

  const displayName =
    selectedUser.name || selectedUser.userName;

  return (
    <div className="flex-1 min-w-0 h-full min-h-0 flex flex-col bg-[#0d1117]">

      {/* ================= HEADER ================= */}

      <div
        className="
          w-full
          h-16 sm:h-[70px]
          bg-[#161b22]
          border-b border-white/5
          flex items-center
          px-3 sm:px-4
          gap-2.5 sm:gap-3
          shrink-0
        "
      >
        {/* Mobile back button */}
        <button
          onClick={() => setSelectedUser(null)}
          className="
            md:hidden
            w-9 h-9
            flex items-center justify-center
            rounded-full
            text-zinc-300
            hover:bg-white/5
            active:bg-white/10
            transition
            shrink-0
          "
        >
          ←
        </button>

        {/* Avatar */}
        <div
          className="
            w-9 h-9
            sm:w-10 sm:h-10
            rounded-full
            bg-[#20c7ff]/15
            border border-[#20c7ff]/30
            flex items-center justify-center
            text-[#20c7ff]
            font-bold
            text-base sm:text-lg
            overflow-hidden
            shrink-0
          "
        >
          {selectedUser.image ? (
            <img
              src={selectedUser.image}
              className="w-full h-full object-cover"
              alt=""
            />
          ) : (
            displayName?.[0]?.toUpperCase()
          )}
        </div>

        {/* User information */}
        <div className="flex flex-col justify-center min-w-0 leading-tight">
          <p className="text-zinc-100 font-semibold text-sm sm:text-base truncate">
            {displayName}
          </p>

          <p className="text-zinc-500 text-[10px] sm:text-xs truncate">
            {selectedUser.email}
          </p>
        </div>
      </div>

      {/* ================= MESSAGES ================= */}

      <div
        className="
          flex-1
          min-h-0
          overflow-y-auto
          px-3 py-3
          sm:p-4
          bg-[#0d1117]
          flex flex-col
          gap-2

          [scrollbar-width:thin]
          [scrollbar-color:rgba(255,255,255,0.18)_transparent]

          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-white/15
          hover:[&::-webkit-scrollbar-thumb]:bg-white/35
        "
      >
        {messages.length === 0 && (
          <p className="text-center text-zinc-500 mt-8 sm:mt-10 text-sm">
            No messages yet. Say hi! 👋
          </p>
        )}

        {messages.map((msg) => {
          const isMe =
            msg.senderId === userData?._id;

          return (
            <div
              key={msg._id}
              className={`flex ${isMe
                ? "justify-end"
                : "justify-start"
                }`}
            >
              <div
                className={`
                  max-w-[85%]
                  sm:max-w-[70%]

                  px-3.5 py-2
                  sm:px-4 sm:py-2

                  rounded-2xl
                  text-sm

                  break-words
                  overflow-wrap-anywhere

                  ${isMe
                    ? "bg-[#20c7ff] text-white rounded-br-none"
                    : "bg-[#1c2230] text-zinc-200 rounded-bl-none border border-white/5"
                  }
                `}
              >
                <p className="break-words">
                  {msg.message}
                </p>

                <p
                  className={`
                    text-[9px]
                    sm:text-[10px]
                    mt-1
                    ${isMe
                      ? "text-blue-100"
                      : "text-zinc-500"
                    }
                  `}
                >
                  {new Date(
                    msg.createdAt
                  ).toLocaleTimeString([], {
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

      {/* ================= MESSAGE INPUT ================= */}

      <div
        className="
          w-full
          min-h-[64px]
          sm:h-[70px]
          bg-[#161b22]
          border-t border-white/5

          flex items-center

          px-2.5
          sm:px-4

          gap-2
          sm:gap-3

          shrink-0

          relative
        "
      >
        {/* ================= EMOJI ================= */}

        <div
          ref={emojiRef}
          className="relative shrink-0"
        >
          <button
            type="button"
            onClick={() =>
              setShowEmojiPicker((prev) => !prev)
            }
            className="
              w-9 h-9
              sm:w-10 sm:h-10

              flex items-center justify-center

              rounded-full

              text-zinc-400

              hover:text-[#20c7ff]
              hover:bg-white/5

              active:bg-white/10

              transition
            "
          >
            <Smile
              size={20}
              className="sm:w-[22px] sm:h-[22px]"
            />
          </button>

          {/* ================= EMOJI PICKER ================= */}

          {showEmojiPicker && (
            <div
              className="
                fixed
                z-[100]

                bottom-[70px]
                sm:bottom-[76px]

                left-2
                right-2

                sm:left-auto
                sm:right-4

                flex
                justify-center

                shadow-2xl
                shadow-black/50

                rounded-xl
                overflow-hidden
              "
            >
              <div
                className="
                  w-full
                  max-w-[320px]
                  sm:w-[320px]
                "
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme="dark"
                  autoFocusSearch={false}
                  lazyLoadEmojis
                  previewConfig={{
                    showPreview: false,
                  }}
                  height={360}
                  width="100%"
                />
              </div>
            </div>
          )}
        </div>

        {/* ================= INPUT ================= */}

        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
          onKeyDown={handleKeyDown}
          className="
            flex-1
            min-w-0

            h-10
            sm:h-11

            outline-none

            border
            border-white/10

            focus:border-[#20c7ff]/60

            rounded-full

            px-3.5
            sm:px-4

            bg-[#0d1117]

            text-sm
            sm:text-base

            text-zinc-200

            placeholder-zinc-500

            transition
          "
        />

        {/* ================= SEND ================= */}

        <button
          onClick={handleSend}
          disabled={!text.trim() || isSending}
          className="
    w-10 h-10
    sm:w-11 sm:h-11

    bg-[#20c7ff]

    rounded-full

    flex items-center justify-center

    text-white
    text-lg
    sm:text-xl

    hover:opacity-80
    active:scale-95

    disabled:opacity-40
    disabled:cursor-not-allowed

    transition

    shrink-0
  "
        >
          {isSending ? (
            <span className="text-sm animate-pulse">...</span>
          ) : (
            "➤"
          )}
        </button>
      </div>
    </div>
  );
}

export default ChatArea;