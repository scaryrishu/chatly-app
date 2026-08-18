import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import App from './App.jsx'
import { store, persistor } from './redux/store.js'
import { SocketProvider } from './context/SocketContext.jsx'  // ← add
import './index.css'

export const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>                                  {/* redux store toolkit ke lie */}
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>                                       {/* routes working ke lie */}
          <SocketProvider>      
            <App />
          </SocketProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
)