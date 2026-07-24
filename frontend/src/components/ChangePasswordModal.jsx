import React, { useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../main'
import toast from 'react-hot-toast'

function ChangePasswordModal({ onClose }) {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setErr("")

    if (newPassword !== confirmPassword) {
      setErr("new password and confirm password do not match")
      return
    }

    setLoading(true)
    try {
      const result = await axios.post(
        `${serverUrl}/api/user/change-password`,
        { oldPassword, newPassword },
        { withCredentials: true }
      )
      toast.success(result.data.message || "password changed successfully")
      onClose()
    } catch (error) {
      setErr(error?.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
      <div className='w-full max-w-100 bg-white rounded-lg shadow-lg p-6 flex flex-col gap-4'>

        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-bold text-gray-700'>Change Password</h2>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600 text-xl'>&times;</button>
        </div>

        <form className='flex flex-col gap-3' onSubmit={handleChangePassword}>
          <input
            type="password"
            placeholder="current password"
            className='w-full h-11 outline-none border-2 border-[#20c7ff] px-3 rounded-lg text-gray-700'
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="new password"
            className='w-full h-11 outline-none border-2 border-[#20c7ff] px-3 rounded-lg text-gray-700'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="confirm new password"
            className='w-full h-11 outline-none border-2 border-[#20c7ff] px-3 rounded-lg text-gray-700'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {err && <p className='text-red-500 text-sm'>* {err}</p>}

          <button
            className='w-full py-2 bg-[#20c7ff] rounded-lg text-white font-semibold hover:shadow-inner disabled:opacity-60'
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

      </div>
    </div>
  )
}

export default ChangePasswordModal