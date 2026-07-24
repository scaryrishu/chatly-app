import { persistStore, persistReducer } from 'redux-persist'
import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'

// Create a proper async storage implementation
const asyncStorage = {
  getItem: async (key) => {
    try {
      return localStorage.getItem(key)
    } catch (e) {
      console.warn('localStorage getItem error:', e)
      return null
    }
  },
  setItem: async (key, value) => {
    try {
      localStorage.setItem(key, value)
    } catch (e) {
      console.warn('localStorage setItem error:', e)
    }
  },
  removeItem: async (key) => {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.warn('localStorage removeItem error:', e)
    }
  },
}

const persistConfig = {
  key: 'user',
  storage: asyncStorage,
  whitelist: ['userData'],
  timeout: 10000,
}

const persistedUserReducer = persistReducer(persistConfig, userReducer)

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredActionPaths: ['payload.err'],
      },
    }),
})

export const persistor = persistStore(store)