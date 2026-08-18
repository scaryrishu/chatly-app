import axios from "axios";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../main";
import { setUserData } from "../redux/userSlice.js";
import dp from "../assets/dp.webp";
import { FaCamera } from "react-icons/fa6";

function Profile() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userData } = useSelector((state) => state.user);
    const fileInputRef = useRef(null);

    const [name, setName] = useState(userData?.name || "");
    const [frontendImage, setFrontendImage] = useState(userData?.image || "");
    const [backendImage, setBackendImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setBackendImage(file);
        setFrontendImage(URL.createObjectURL(file));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErr("");

        try {
            const formData = new FormData();
            formData.append("name", name);

            if (backendImage) formData.append("image", backendImage);

            const result = await axios.put(
                `${serverUrl}/api/user/profile`,
                formData,
                { withCredentials: true },
            );

            dispatch(setUserData(result.data));
            navigate("/");
        } catch (error) {
            setErr(error?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
            <div className="w-full max-w-[500px] bg-[#161b22] border border-white/10 rounded-2xl shadow-2xl shadow-black/40 flex flex-col gap-8 py-10">
                <div className="w-full flex items-center justify-center">
                    <h1 className="text-zinc-100 font-bold text-[28px]">
                        Edit <span className="text-[#20c7ff]">Profile</span>
                    </h1>
                </div>

                <form
                    className="w-full flex flex-col gap-5 items-center"
                    onSubmit={handleSave}
                >
                    <div className="relative w-[100px] h-[100px]">
                        <div
                            className="w-full h-full rounded-full border-2 border-[#20c7ff]/70 overflow-hidden cursor-pointer bg-[#0d1117]"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <img
                                src={frontendImage || dp}
                                className="w-full h-full object-cover"
                                alt="Profile preview"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-1 -right-1 z-50 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#161b22] bg-[#20c7ff] text-white hover:opacity-85 transition"
                        >
                            <FaCamera className="text-sm" />
                        </button>
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImage}
                        className="hidden"
                    />

                    <div className="w-[90%] flex flex-col gap-1.5">
                        <p className="text-sm text-zinc-500">Username</p>
                        <p className="w-full h-[50px] flex items-center border border-white/5 px-5 bg-[#0d1117]/60 rounded-lg text-zinc-500 text-[17px] opacity-70 select-none cursor-not-allowed">
                            @{userData?.userName}
                        </p>
                    </div>

                    <div className="w-[90%] flex flex-col gap-1.5">
                        <p className="text-sm text-zinc-500">Email</p>
                        <p className="w-full h-[50px] flex items-center border border-white/5 px-5 bg-[#0d1117]/60 rounded-lg text-zinc-500 text-[17px] opacity-70 select-none cursor-not-allowed">
                            {userData?.email}
                        </p>
                    </div>

                    <div className="w-[90%] flex flex-col gap-1.5">
                        <p className="text-sm text-zinc-400">Name</p>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            maxLength={20}
                            className="w-full h-[50px] outline-none border border-white/10 focus:border-[#20c7ff]/70 px-5 bg-[#0d1117] rounded-lg text-zinc-100 placeholder-zinc-600 text-[17px] transition"
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                        />
                        <p className="text-right text-xs text-zinc-500">
                            {name.length}/20
                        </p>
                    </div>

                    {err && <p className="text-red-400">* {err}</p>}

                    <button
                        className="px-5 py-2.5 bg-[#20c7ff] rounded-xl shadow-lg shadow-[#20c7ff]/15 text-white text-[18px] w-[200px] mt-2 font-semibold hover:bg-[#12b9ef] disabled:opacity-60 disabled:cursor-not-allowed transition"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>

                    <button
                        type="button"
                        className="cursor-pointer text-zinc-400 hover:text-zinc-100 transition"
                        onClick={() => navigate("/")}
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Profile;