import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { MoreVertical, Search, UserRound, KeyRound, LogOut, Trash2 } from "lucide-react";
import { serverUrl } from "../main";
import useChatStore from "../zustand/useChatStore";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUserData } from "../redux/userSlice";
import { useSocket } from "../context/SocketContext";
import DeleteAccountModal from "./DeleteAccountModal";
import ChangePasswordModal from "./ChangePasswordModal";
import dp from "../assets/dp.webp"

function Sidebar() {
  const {
    users,
    setUsers,
    selectedUser,
    setSelectedUser,
    unreadCounts,
    fetchUnreadCounts,
  } = useChatStore();
  const userData = useSelector((state) => state.user.userData);
  const { onlineUsers } = useSocket();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const menuRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Fetch all users + any unread messages waiting from before this login
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const result = await axios.get(`${serverUrl}/api/user/all`, {
          withCredentials: true,
        });
        setUsers(result.data);
      } catch (error) {
        console.log("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
    fetchUnreadCounts();
  }, []);

  // Close the dropdown when clicking outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${serverUrl}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
      dispatch(clearUserData());
      navigate("/login");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  const filteredUsers = users.filter((user) =>
    (user.userName || "").toLowerCase().includes(search.toLowerCase()) ||
    (user.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const menuItems = [
    { label: "Edit Profile", icon: UserRound, onClick: () => navigate("/profile") },
    { label: "Change Password", icon: KeyRound, onClick: () => setShowChangePasswordModal(true) },
    { label: "Logout", icon: LogOut, onClick: handleLogout },
    { label: "Delete Account", icon: Trash2, onClick: () => setShowDeleteModal(true), danger: true },
  ];

  return (
    <div className="w-full h-full bg-[#0d1117] text-zinc-200 flex flex-col font-[Inter,ui-sans-serif,system-ui,sans-serif]">
      {/* Header */}
      <div className="w-full h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
        <h2
          onClick={() => setSelectedUser(null)}
          className="text-[#20c7ff] font-bold text-xl tracking-tight cursor-pointer select-none hover:opacity-80 transition"
        >
          Chatly
        </h2>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-300 hidden sm:block">
              @{userData?.userName}
            </span>

            <div className="w-9 h-9 rounded-full bg-[#20c7ff]/15 border border-[#20c7ff]/40 flex items-center justify-center text-[#20c7ff] font-semibold text-sm overflow-hidden">
              <img
                src={userData?.image || dp}
                alt={userData?.userName || "Profile"}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Dropdown menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition"
            >
              <MoreVertical size={19} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 w-52 bg-[#161b22] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {menuItems.map(({ label, icon: Icon, onClick, danger }) => (
                  <button
                    key={label}
                    onClick={() => {
                      setMenuOpen(false);
                      onClick();
                    }}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition
                      ${danger
                        ? "text-red-400 hover:bg-red-500/10"
                        : "text-zinc-200 hover:bg-white/5"}`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search or start a new chat"
            className="w-full h-10 rounded-full bg-[#161b22] border border-white/5 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-[#20c7ff]/50 transition"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-center text-zinc-500 mt-10 text-sm">Loading...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center text-zinc-500 mt-10 text-sm">No users found</p>
        ) : (
          filteredUsers.map((user) => {
            const unread = unreadCounts[user._id] || 0;
            return (
              <div
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`w-full px-4 py-3 flex items-center gap-3 cursor-pointer border-b border-white/5 transition
                  ${selectedUser?._id === user._id ? "bg-white/5" : "hover:bg-white/[0.03]"}
                `}
              >
                {/* Avatar with online dot */}
                <div className="relative w-11 h-11 shrink-0">
                  <div className="w-full h-full rounded-full bg-[#20c7ff]/15 border border-[#20c7ff]/30 flex items-center justify-center text-[#20c7ff] font-semibold text-base overflow-hidden">
                    <img
                      src={user.image || dp}
                      alt={user.userName || "User"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {onlineUsers.includes(user._id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0d1117]" />
                  )}
                </div>

                {/* Name — shows the display name once set, username in the meantime */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm truncate ${unread > 0
                      ? "font-semibold text-white"
                      : "font-medium text-zinc-100"
                      }`}
                  >
                    {user.name || "No name"}
                  </p>

                  <p className="text-xs text-zinc-500 truncate">
                    @{user.userName}
                  </p>
                </div>

                {/* Unread badge */}
                {unread > 0 && (
                  <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-[#20c7ff] text-white text-[11px] font-bold flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {showDeleteModal && (
        <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
      )}
      {showChangePasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowChangePasswordModal(false)}
        />
      )}
    </div>
  );
}

export default Sidebar;