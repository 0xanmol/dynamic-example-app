import { useState } from 'react'
import { useDynamicContext, useSwitchNetwork } from '@dynamic-labs/sdk-react-core'

const NetworkSwitcher = () => {
  const { primaryWallet } = useDynamicContext()
  const switchNetwork = useSwitchNetwork()
  const [isOpen, setIsOpen] = useState(false)
  const [switching, setSwitching] = useState(false)

  const networks = [
    { 
      name: 'Ethereum Sepolia', 
      chainId: 11155111,
      status: 'primary',
      shortName: 'Sepolia'
    },
    { 
      name: 'Polygon Mumbai', 
      chainId: 80001,
      status: 'supported',
      shortName: 'Mumbai'
    },
    { 
      name: 'Base Sepolia', 
      chainId: 84532,
      status: 'aa-ready',
      shortName: 'Base'
    },
  ]

  const handleSwitchNetwork = async (chainId: number) => {
    if (!primaryWallet) return
    
    setSwitching(true)
    try {
      await switchNetwork({ wallet: primaryWallet, chain: chainId })
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to switch network:', error)
    } finally {
      setSwitching(false)
    }
  }

  if (!primaryWallet) {
    return null // Don't show if wallet not connected
  }

  const currentNetwork = networks.find(n => n.chainId === primaryWallet.chain?.id)
  const displayName = currentNetwork?.shortName || primaryWallet.chain?.name || 'Unknown'

  return (
    <div className="network-dropdown">
      <button 
        className="network-trigger"
        onClick={() => setIsOpen(!isOpen)}
        disabled={switching}
      >
        <span className={`status-dot ${currentNetwork?.status || 'unknown'}`}></span>
        <span className="network-label">{displayName}</span>
        <span className="dropdown-arrow">▼</span>
      </button>
      
      {isOpen && (
        <div className="network-dropdown-menu">
          {networks.map((network) => {
            const isActive = primaryWallet.chain?.id === network.chainId
            
            return (
              <button
                key={network.chainId}
                className={`network-option ${isActive ? 'active' : ''}`}
                onClick={() => handleSwitchNetwork(network.chainId)}
                disabled={switching || isActive}
              >
                <span className={`status-dot ${network.status}`}></span>
                <span className="network-name">{network.shortName}</span>
                {isActive && <span className="check">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default NetworkSwitcher