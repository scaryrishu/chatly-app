import { create } from 'zustand'
import axios from 'axios'
import { serverUrl } from '../main'

const useChatStore = create((set, get) => ({
  users: [],
  selectedUser: null,
  messages: [],
  unreadCounts: {}, // { [userId]: count }

  resetChatStore: () => set({
    users: [],
    selectedUser: null,
    messages: [],
    unreadCounts: {}
  }),

  setUsers: (users) => set({ users }),

  setSelectedUser: (user) => {
    const { selectedUser } = get()

    // Clicking the chat that's already open shouldn't do anything — in
    // particular it must NOT clear messages, since ChatArea's fetch effect
    // is keyed on selectedUser and won't re-fire for the same reference,
    // which previously left the chat wiped with nothing to reload it.
    if (user && selectedUser && user._id === selectedUser._id) return

    // Clearing messages here (not just when a new user is picked) means
    // closing a chat behaves exactly like a fresh page load — no stale
    // messages hanging around until the next fetch completes.
    set({ selectedUser: user, messages: [] })
    // opening a chat clears its badge right away (backend also marks it seen
    // in the DB once fetchMessages runs)
    if (user) {
      set((state) => ({
        unreadCounts: { ...state.unreadCounts, [user._id]: 0 }
      }))
    }
  },

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
  sendMessage: async (receiverId, message, imageFile) => {
  try {

    let payload
    const config = { withCredentials: true }

    if (imageFile) {
      payload = new FormData()
      payload.append("message", message || "")
      payload.append("image", imageFile)
    } else {
      payload = { message }
    }

    const result = await axios.post(
      `${serverUrl}/api/message/send/${receiverId}`,
      payload,
      config
    );

    set((state) => ({
      messages: [...state.messages, result.data]
    }));

    return result.data;
  } catch (error) {
    console.log("sendMessage error:", error);
    throw error;
  }
},
  // Pull unread counts for every conversation — call once on login / app mount
  fetchUnreadCounts: async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/message/conversations/last`,
        { withCredentials: true }
      )
      const counts = {}
      result.data.forEach((conv) => {
        counts[conv.userId] = conv.unreadCount
      })
      set({ unreadCounts: counts })
    } catch (error) {
      console.log("fetchUnreadCounts error:", error)
    }
  },

  // Called by the socket listener whenever a message arrives in real time.
  // Centralizing this here (instead of inside ChatArea) means the sidebar
  // gets unread updates even for chats that aren't currently open.
  receiveMessage: (newMessage) => {
  const { selectedUser, messages, unreadCounts } = get()

  const exists = messages.some(
    (msg) => msg._id === newMessage._id
  )

  if (exists) {
    return
  }

  if (
    selectedUser &&
    newMessage.senderId === selectedUser._id
  ) {
    set({
      messages: [...messages, newMessage],
    })
  } else {
    set({
      unreadCounts: {
        ...unreadCounts,
        [newMessage.senderId]:
          (unreadCounts[newMessage.senderId] || 0) + 1,
      },
    })
  }
},
}))

export default useChatStore