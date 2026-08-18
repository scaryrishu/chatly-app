import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../main";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice.js";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/login`,
        { email, password },
        { withCredentials: true },
      );

      dispatch(setUserData(result.data));
      navigate("/");
      setEmail("");
      setPassword("");
    } catch (error) {
      setErr(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] overflow-hidden rounded-2xl border border-white/10 bg-[#161b22] shadow-2xl shadow-black/50">
        <div className="w-full h-44 bg-[#20c7ff] rounded-b-[35%] shadow-lg shadow-[#20c7ff]/15 flex items-center justify-center">
          <h1 className="text-zinc-900 font-bold text-[30px]">
            Login to <span className="text-white">Chatly</span>
          </h1>
        </div>

        <form
          className="w-full flex flex-col gap-5 items-center px-6 py-10"
          onSubmit={handleLogin}
        >
          <input
            type="email"
            placeholder="Email"
            className="w-full h-12 outline-none border border-white/10 focus:border-[#20c7ff]/70 px-5 bg-[#0d1117] rounded-lg text-zinc-100 placeholder-zinc-600 text-[17px] transition"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />

          <div className="w-full h-12 border border-white/10 focus-within:border-[#20c7ff]/70 overflow-hidden rounded-lg bg-[#0d1117] relative transition">
            <input
              type={show ? "text" : "password"}
              placeholder="Password"
              className="w-full h-full outline-none px-5 pr-16 bg-transparent text-zinc-100 placeholder-zinc-600 text-[17px]"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />

            <button
              type="button"
              className="absolute top-1/2 right-4 -translate-y-1/2 text-sm text-[#20c7ff] font-semibold hover:text-[#70dcff] transition"
              onClick={() => setShow((prev) => !prev)}
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>

          {err && <p className="w-full text-red-400 text-sm">* {err}</p>}

          <button
            className="px-5 py-2.5 bg-[#20c7ff] rounded-xl shadow-lg shadow-[#20c7ff]/15 text-white text-[18px] w-[200px] mt-3 font-semibold hover:bg-[#12b9ef] disabled:opacity-60 disabled:cursor-not-allowed transition"
            disabled={loading}
          >
            {loading ? "Loading..." : "Login"}
          </button>

          <p className="text-zinc-400 text-sm">
            Don&apos;t have an account?
            <button
              type="button"
              className="text-[#20c7ff] font-bold hover:text-[#70dcff] transition ml-1"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;