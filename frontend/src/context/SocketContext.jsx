import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useSelector } from 'react-redux'
import { serverUrl } from '../main'
import useChatStore from '../zustand/useChatStore'

const SocketContext = createContext()

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const userData = useSelector(state => state.user.userData)

  useEffect(() => {
    if (userData) {
      const newSocket = io(serverUrl, {
        query: { userId: userData._id }
      })

      setSocket(newSocket)

      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users)
      })

      // Single global listener: every incoming message goes straight to the
      // chat store, which decides whether to append it (chat open) or bump
      // the sidebar's unread badge (chat closed) — works regardless of
      // which page is currently mounted.
      newSocket.on("newMessage", (message) => {
        useChatStore.getState().receiveMessage(message)
      })

      return () => newSocket.close()
    } else {
      if (socket) {
        socket.close()
        setSocket(null)
      }
    }
  }, [userData])

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  )
}