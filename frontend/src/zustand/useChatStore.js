import { create } from 'zustand'
import axios from 'axios'
import { serverUrl } from '../main'

const useChatStore = create((set, get) => ({
  users: [],
  selectedUser: null,
  messages: [],

  setUsers: (users) => set({ users }),
  setSelectedUser: (user) => set({ selectedUser: user }),
  setMessages: (messages) => set({ messages }),

  // Fetch messages for selected user
  fetchMessages: async (receiverId) => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/message/${receiverId}`,
        { withCredentials: true }
      )
      set({ messages: result.data })
    } catch (error) {
      console.log("fetchMessages error:", error)
    }
  },

  // Send a message
  sendMessage: async (receiverId, message) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/message/send/${receiverId}`,
        { message },
        { withCredentials: true }
      )
      // Add new message to existing list
      set((state) => ({
        messages: [...state.messages, result.data]
      }))
    } catch (error) {
      console.log("sendMessage error:", error)
    }
  },

}))

export default useChatStore