import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../main.jsx";
import { clearUserData } from "../redux/userSlice.js";

function DeleteAccountModal({ onClose }) {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDelete = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      await axios.delete(`${serverUrl}/api/user/delete`, {
        data: { password },
        withCredentials: true,
      });

      dispatch(clearUserData());
      navigate("/login");
    } catch (error) {
      setErr(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-[400px] rounded-2xl border border-red-500/20 bg-[#161b22] p-6 shadow-2xl shadow-black/50 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-red-400">Delete Account</h2>

        <p className="text-zinc-400 text-sm leading-relaxed">
          This action is permanent. Enter your password to confirm.
        </p>

        <form onSubmit={handleDelete} className="flex flex-col gap-3">
          <input
            type="password"
            placeholder="Confirm your password"
            className="w-full h-11 outline-none border border-red-500/30 focus:border-red-400 px-4 rounded-lg bg-[#0d1117] text-zinc-100 placeholder-zinc-600 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {err && <p className="text-red-400 text-sm">* {err}</p>}

          <div className="flex gap-3 justify-end mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeleteAccountModal;