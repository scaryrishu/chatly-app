import React from 'react'
import Sidebar from '../components/Sidebar'
import ChatArea from '../components/ChatArea'
import useChatStore from '../zustand/useChatStore'

function Home() {
  const { selectedUser } = useChatStore()

  return (
    <div className='w-full h-screen flex'>
      <div className={`
        w-full md:w-75 h-full
        ${selectedUser ? 'hidden md:block' : 'block'}
      `}>
        <Sidebar />
      </div>

      <div className={`
        flex-1 h-full
        ${selectedUser ? 'block' : 'hidden md:block'}
      `}>
        <ChatArea />
      </div>
    </div>
  )
}

export default Home