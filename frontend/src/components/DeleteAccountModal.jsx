import axios from "axios"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { serverUrl } from "../main.jsx"
import { clearUserData } from "../redux/userSlice.js"

function DeleteAccountModal({ onClose }) {
    const [password, setPassword] = useState("")
    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleDelete = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await axios.delete(`${serverUrl}/api/user/delete`, {
                data: { password },
                withCredentials: true
            })
            dispatch(clearUserData())
            navigate("/login")
        } catch (error) {
            setErr(error?.response?.data?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg p-6 w-[90%] max-w-100 flex flex-col gap-4'>
                <h2 className='text-xl font-bold text-red-500'>Delete Account</h2>
                <p className='text-gray-600 text-sm'>This action is permanent. Enter your password to confirm.</p>
                <form onSubmit={handleDelete} className='flex flex-col gap-3'>
                    <input
                        type="password"
                        placeholder="Confirm your password"
                        className='w-full h-11.25 outline-none border-2 border-red-300 px-3.75 rounded-lg'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {err && <p className='text-red-500 text-sm'>* {err}</p>}
                    <div className='flex gap-3 justify-end'>
                        <button type="button" onClick={onClose} className='px-4 py-2 rounded-lg border'>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className='px-4 py-2 rounded-lg bg-red-500 text-white font-semibold'>
                            {loading ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default DeleteAccountModal