import React, { useState } from "react";
import axios from "axios";
import { serverUrl } from "../main";
import toast from "react-hot-toast";

function ChangePasswordModal({ onClose }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErr("");

    if (newPassword !== confirmPassword) {
      setErr("New password and confirm password do not match");
      return;
    }

    setLoading(true);

    try {
      const result = await axios.post(
        `${serverUrl}/api/user/change-password`,
        { oldPassword, newPassword },
        { withCredentials: true },
      );

      toast.success(result.data.message || "Password changed successfully");
      onClose();
    } catch (error) {
      setErr(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-[400px] rounded-2xl border border-white/10 bg-[#161b22] p-6 shadow-2xl shadow-black/50 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-100">
            Change Password
          </h2>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-white text-2xl transition"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleChangePassword}>
          <input
            type="password"
            placeholder="Current password"
            className="w-full h-11 outline-none border border-white/10 focus:border-[#20c7ff]/70 px-3 rounded-lg bg-[#0d1117] text-zinc-100 placeholder-zinc-600 transition"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="New password"
            className="w-full h-11 outline-none border border-white/10 focus:border-[#20c7ff]/70 px-3 rounded-lg bg-[#0d1117] text-zinc-100 placeholder-zinc-600 transition"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full h-11 outline-none border border-white/10 focus:border-[#20c7ff]/70 px-3 rounded-lg bg-[#0d1117] text-zinc-100 placeholder-zinc-600 transition"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {err && <p className="text-red-400 text-sm">* {err}</p>}

          <button
            className="w-full py-2.5 mt-1 bg-[#20c7ff] rounded-lg text-white font-semibold hover:bg-[#12b9ef] disabled:opacity-60 disabled:cursor-not-allowed transition"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;