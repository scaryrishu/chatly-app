import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../main";
import useChatStore from "../zustand/useChatStore";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUserData } from "../redux/userSlice";
import { useSocket } from "../context/SocketContext";
import DeleteAccountModal from "./DeleteAccountModal";
import ChangePasswordModal from "./ChangePasswordModal";

function Sidebar() {
  const { users, setUsers, selectedUser, setSelectedUser } = useChatStore();
  const userData = useSelector((state) => state.user.userData);
  const { onlineUsers } = useSocket();
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Fetch all users on mount
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

  return (
    <div className="w-full h-full bg-white border-r-2 border-gray-200 flex flex-col">
      {/* Header */}
      <div className="w-full h-17.5 bg-[#20c7ff] flex items-center px-4">
        <h2 className="text-white font-bold text-xl">Chats</h2>
      </div>

      {/* Current User Info + Logout */}
      <div className="w-full px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#20c7ff] flex items-center justify-center text-white font-bold">
            {userData?.userName?.[0]?.toUpperCase()}
          </div>
          <p className="font-semibold text-gray-700">{userData?.userName}</p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 font-semibold hover:underline whitespace-nowrap"
          >
            Logout
          </button>
          <button
            onClick={() => setShowChangePasswordModal(true)}
            className="text-xs text-[#20c7ff] hover:underline whitespace-nowrap"
          >
            Change Password
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-xs text-gray-400 hover:text-red-500 hover:underline whitespace-nowrap"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-center text-gray-400 mt-10">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">No users found</p>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-100 transition
                ${selectedUser?._id === user._id ? "bg-slate-200" : ""}
              `}
            >
              {/* Avatar with online dot */}
              <div className="relative w-11.25 h-11.25 shrink-0">
                <div className="w-full h-full rounded-full bg-[#20c7ff] flex items-center justify-center text-white font-bold text-lg">
                  {user.userName?.[0]?.toUpperCase()}
                </div>
                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>

              {/* Name */}
              <div>
                <p className="font-semibold text-gray-700">{user.userName}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
            </div>
          ))
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
