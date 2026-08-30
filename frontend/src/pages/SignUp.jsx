import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../main";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice.js";
import { GoogleLogin } from "@react-oauth/google"

function SignUp() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [show, setShow] = useState(false);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErr("");

    // Validate BEFORE flipping loading on — this used to run after
    // setLoading(true) and then `return` early, skipping the try/finally
    // that resets it, so the button stayed stuck on "Loading..." forever.
    if (userName.length > 14) {
      setErr("username must be less than 15 characters");
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { userName, email, password },
        { withCredentials: true },
      );

      dispatch(setUserData(result.data));
      navigate("/");
      setUserName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      setErr(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setErr(""); setLoading(true)
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/google`,
        { credential: credentialResponse.credential },
        { withCredentials: true },
      )
      dispatch(setUserData(result.data))
      navigate("/")
    } catch (error) {
      setErr(error?.response?.data?.message || "Google login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] overflow-hidden rounded-2xl border border-white/10 bg-[#161b22] shadow-2xl shadow-black/50">
        <div className="w-full h-44 bg-[#20c7ff] rounded-b-[35%] shadow-lg shadow-[#20c7ff]/15 flex items-center justify-center">
          <h1 className="text-zinc-900 font-bold text-[30px]">
            Welcome to <span className="text-white">Chatly</span>
          </h1>
        </div>

        <form
          className="w-full flex flex-col gap-5 items-center px-6 py-10"
          onSubmit={handleSignUp}
        >
          <input
            type="text"
            placeholder="Username"
            className="w-full h-12 outline-none border border-white/10 focus:border-[#20c7ff]/70 px-5 bg-[#0d1117] rounded-lg text-zinc-100 placeholder-zinc-600 text-[17px] transition"
            onChange={(e) => {
              setUserName(e.target.value);
              // clear a stale error the moment the field changes, so the
              // old message doesn't sit there while they're actively fixing it
              if (err) setErr("");
            }}
            value={userName}
            required
          />

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
            {loading ? "Loading..." : "Sign Up"}
          </button>

          <div className="w-full flex items-center gap-3 text-zinc-500 text-xs">
            <div className="flex-1 h-px bg-white/10" /> OR <div className="flex-1 h-px bg-white/10" />
          </div>

          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErr("Google login failed")}
            theme="filled_black"
            shape="pill"
            width="100%"
          />

          <p className="text-zinc-400 text-sm">
            Already have an account?
            <button
              type="button"
              className="text-[#20c7ff] font-bold hover:text-[#70dcff] transition ml-1"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUp;