import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useSelector } from 'react-redux'
import { serverUrl } from '../main'

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