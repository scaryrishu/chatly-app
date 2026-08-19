import axios from "axios"
import { serverUrl } from "../main.jsx"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { clearUserData } from "../redux/userSlice.js"
import { useState } from "react"
import useChatStore from "../zustand/useChatStore.js"

function DeleteAccount() {
    const [password, setPassword] = useState("")
    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleDelete = async (e) => {
        e.preventDefault()
        if (!window.confirm("This will permanently delete your account. Continue?")) return

        setLoading(true)
        try {
            await axios.delete(`${serverUrl}/api/user/delete`, {
                data: { password },      // axios requires body in `data` for DELETE
                withCredentials: true
            })
            dispatch(clearUserData())
            useChatStore.getState().resetChatStore()
            navigate("/login")
        } catch (error) {
            setErr(error?.response?.data?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleDelete} className='flex flex-col gap-4 items-center'>
            <input
                type="password"
                placeholder="Confirm your password"
                className='w-[90%] h-12.5 outline-none border-2 border-red-400 px-5 py-2.5 bg-white rounded-lg text-gray-700 text-[19px]'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {err && <p className='text-red-500'>* {err}</p>}
            <button
                type="submit"
                disabled={loading}
                className='px-5 py-2.5 bg-red-500 text-white rounded-2xl shadow-lg font-semibold'
            >
                {loading ? "Deleting..." : "Delete Account"}
            </button>
        </form>
    )
}

export default DeleteAccount