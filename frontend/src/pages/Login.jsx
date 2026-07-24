import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../main'
import { useDispatch } from 'react-redux'
import { setUserData } from "../redux/userSlice.js";

function Login() {
    let navigate = useNavigate()
    let [show, setShow] = useState(false)
    let [email, setEmail] = useState("")
    let [password, setPassword] = useState("")
    let [loading, setLoading] = useState(false)
    let [err, setErr] = useState("")
    let dispatch = useDispatch()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            let result = await axios.post(`${serverUrl}/api/auth/login`, {
                email, password
            }, { withCredentials: true })

            console.log("result.data →", result.data) // ← check this in console

            dispatch(setUserData(result.data))
            navigate("/")
            setEmail("")
            setPassword("")
            setLoading(false)
            setErr("")
        } catch (error) {
            console.log(error)
            setLoading(false)
            setErr(error?.response?.data?.message || "Something went wrong")
        }
    }

    return (
        <div className='w-full h-screen bg-slate-200 flex items-center justify-center'>
            <div className='w-full max-w-125 h-150 bg-white rounded-lg shadow-gray-400 shadow-lg flex flex-col gap-7.5'>

                <div className='w-full h-50 bg-[#20c7ff] rounded-b-[30%] shadow-gray-400 shadow-lg flex items-center justify-center'>
                    <h1 className='text-gray-600 font-bold text-[30px]'>
                        login to <span className='text-white'>chatly</span>
                    </h1>
                </div>

                <form className='w-full flex flex-col gap-5 items-center' onSubmit={handleLogin}>

                    <input
                        type="email"
                        placeholder="email"
                        className='w-[90%] h-12.5 outline-none border-2 border-[#20c7ff] px-5 py-2.5 bg-white rounded-lg shadow-gray-200 shadow-lg text-gray-700 text-[19px]'
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                    />

                    <div className='w-[90%] h-12.5 border-2 border-[#20c7ff] overflow-hidden rounded-lg shadow-gray-200 shadow-lg relative'>
                        <input
                            type={show ? "text" : "password"}
                            placeholder="password"
                            className='w-full h-full outline-none px-5 py-2.5 bg-white text-gray-700 text-[19px]'
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                        />
                        <span
                            className='absolute top-2.5 right-5 text-[19px] text-[#20c7ff] font-semibold cursor-pointer'
                            onClick={() => setShow(prev => !prev)}
                        >
                            {show ? "hide" : "show"}
                        </span>
                    </div>

                    {err && <p className='text-red-500'>* {err}</p>}

                    <button
                        className='px-5 py-2.5 bg-[#20c7ff] rounded-2xl shadow-gray-300 shadow-lg text-[20px] w-50 mt-5 font-semibold hover:shadow-inner'
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Login"}
                    </button>

                    <p className='cursor-pointer' onClick={() => navigate("/signup")}>
                        Don't have an account?
                        <span className='text-[#20c7ff] font-bold'> Sign Up</span>
                    </p>

                </form>
            </div>
        </div>
    )
}

export default Login