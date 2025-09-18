import { useState } from 'react'
import { DynamicWidget, useDynamicContext } from '@dynamic-labs/sdk-react-core'
import NFTMinter from './components/NFTMinter'
import SendTransaction from './components/SendTransaction'
import './App.css'

function App() {
  const { user, handleLogOut } = useDynamicContext()
  const [activeTab, setActiveTab] = useState('auth')

  const tabs = [
    { id: 'auth', label: 'Authentication' },
    { id: 'mint', label: 'Mint NFT' },
    { id: 'send', label: 'Send Money' },
  ]

  return (
    <div className="app">
      <div className="container">
        <h1>Dynamic Labs Demo</h1>
        
        {user && (
          <div className="user-header">
            <div className="user-info">
              <p>Welcome, {user.email || user.alias}</p>
            </div>
            <div className="header-controls">
              <button onClick={handleLogOut} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        )}

        {!user ? (
          <div className="auth-section">
            <DynamicWidget />
          </div>
        ) : (
          <>
            <div className="tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="tab-content">
              {activeTab === 'auth' && (
                <div className="tab-panel">
                  <h2>Authentication Status</h2>
                  <p>You are successfully authenticated with Dynamic Labs</p>
                  <DynamicWidget />
                </div>
              )}
              
              
              {activeTab === 'mint' && (
                <div className="tab-panel">
                  <h2>NFT Minting</h2>
                  <NFTMinter />
                </div>
              )}
              
              {activeTab === 'send' && (
                <div className="tab-panel">
                  <h2>Send Transaction</h2>
                  <SendTransaction />
                </div>
              )}
            </div>
          </>
        )}

        <div className="info">
          <p>Environment: 51910154-0549-4132-8c3c-bdc85bd42457</p>
        </div>
      </div>
    </div>
  )
}

export default App