import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../main'
import toast from 'react-hot-toast'

function ChangePassword() {
  let navigate = useNavigate()
  let [showOld, setShowOld] = useState(false)
  let [showNew, setShowNew] = useState(false)
  let [oldPassword, setOldPassword] = useState("")
  let [newPassword, setNewPassword] = useState("")
  let [confirmPassword, setConfirmPassword] = useState("")
  let [loading, setLoading] = useState(false)
  let [err, setErr] = useState("")

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setErr("")

    if (newPassword !== confirmPassword) {
      setErr("new password and confirm password do not match")
      return
    }

    setLoading(true)
    try {
      let result = await axios.post(`${serverUrl}/api/user/change-password`, {
        oldPassword, newPassword
      }, { withCredentials: true })

      toast.success(result.data.message || "password changed successfully")
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setLoading(false)
    } catch (error) {
      setLoading(false)
      setErr(error?.response?.data?.message || "Something went wrong")
    }
  }

  return (
    <div className='w-full h-screen bg-slate-200 flex items-center justify-center'>
      <div className='w-full max-w-125 h-162.5 bg-white rounded-lg shadow-gray-400 shadow-lg flex flex-col gap-7.5'>

        <div className='w-full h-50 bg-[#20c7ff] rounded-b-[30%] shadow-gray-400 shadow-lg flex items-center justify-center'>
          <h1 className='text-gray-600 font-bold text-[30px]'>
            change <span className='text-white'>password</span>
          </h1>
        </div>

        <form className='w-full flex flex-col gap-5 items-center' onSubmit={handleChangePassword}>

          <div className='w-[90%] h-12.5 border-2 border-[#20c7ff] overflow-hidden rounded-lg shadow-gray-200 shadow-lg relative'>
            <input
              type={showOld ? "text" : "password"}
              placeholder="current password"
              className='w-full h-full outline-none px-5 py-2.5 bg-white text-gray-700 text-[19px]'
              onChange={(e) => setOldPassword(e.target.value)}
              value={oldPassword}
            />
            <span
              className='absolute top-2.5 right-5 text-[19px] text-[#20c7ff] font-semibold cursor-pointer'
              onClick={() => setShowOld(prev => !prev)}
            >
              {showOld ? "hide" : "show"}
            </span>
          </div>

          <div className='w-[90%] h-12.5 border-2 border-[#20c7ff] overflow-hidden rounded-lg shadow-gray-200 shadow-lg relative'>
            <input
              type={showNew ? "text" : "password"}
              placeholder="new password"
              className='w-full h-full outline-none px-5 py-2.5 bg-white text-gray-700 text-[19px]'
              onChange={(e) => setNewPassword(e.target.value)}
              value={newPassword}
            />
            <span
              className='absolute top-2.5 right-5 text-[19px] text-[#20c7ff] font-semibold cursor-pointer'
              onClick={() => setShowNew(prev => !prev)}
            >
              {showNew ? "hide" : "show"}
            </span>
          </div>

          <input
            type="password"
            placeholder="confirm new password"
            className='w-[90%] h-12.5 outline-none border-2 border-[#20c7ff] px-5 py-2.5 bg-white rounded-lg shadow-gray-200 shadow-lg text-gray-700 text-[19px]'
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
          />

          {err && <p className='text-red-500'>* {err}</p>}

          <button
            className='px-5 py-2.5 bg-[#20c7ff] rounded-2xl shadow-gray-300 shadow-lg text-[20px] w-50 mt-5 font-semibold hover:shadow-inner'
            disabled={loading}
          >
            {loading ? "Loading..." : "Change Password"}
          </button>

        </form>
      </div>
    </div>
  )
}

export default ChangePassword