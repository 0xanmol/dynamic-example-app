import { useState } from 'react'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { useTransactionHistory } from '../contexts/TransactionContext'
import { celebrateSuccess } from '../utils/confetti'

// Explorer URLs for different networks
const getExplorerUrl = (chainId: number | undefined, txHash: string): string | null => {
  if (!chainId) return null
  
  const explorers: Record<number, string> = {
    11155111: 'https://sepolia.etherscan.io/tx/', // Ethereum Sepolia
    84532: 'https://sepolia.basescan.org/tx/',    // Base Sepolia
    80002: 'https://amoy.polygonscan.com/tx/',    // Polygon Amoy
    421614: 'https://sepolia.arbiscan.io/tx/',    // Arbitrum Sepolia
    80001: 'https://mumbai.polygonscan.com/tx/',  // Polygon Mumbai (legacy)
  }
  
  return explorers[chainId] ? `${explorers[chainId]}${txHash}` : null
}

// Supported networks for Account Abstraction
const supportedAANetworks = [
  { name: 'Ethereum Sepolia', chainId: 11155111, status: 'primary' },
  { name: 'Base Sepolia', chainId: 84532, status: 'primary' },
  { name: 'Polygon Amoy', chainId: 80002, status: 'supported' },
  { name: 'Arbitrum Sepolia', chainId: 421614, status: 'supported' },
]

export default function AccountAbstraction() {
  const { primaryWallet } = useDynamicContext()
  const { addActivity } = useTransactionHistory()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [mintRecipient, setMintRecipient] = useState('')
  const [isMinting, setIsMinting] = useState(false)
  const [lastTxHash, setLastTxHash] = useState('')
  const [lastNetworkId, setLastNetworkId] = useState<number | null>(null)

  const isSmartWallet = primaryWallet?.connector?.name?.includes('ZeroDev')

  const handleGaslessTransfer = async () => {
    if (!primaryWallet || !recipient || !amount) {
      setMessage('Please connect wallet and fill all fields')
      return
    }

    if (!isSmartWallet) {
      setMessage('Please connect with a ZeroDev smart wallet for gasless transactions')
      return
    }

    try {
      setIsLoading(true)
      setMessage('Sending gasless transaction...')
      setLastTxHash('')
      setLastNetworkId(null)

      const walletClient = await (primaryWallet as any).getWalletClient()
      const { parseEther } = await import('viem')
      
      const valueInWei = parseEther(amount)
      
      console.log('🔍 ZeroDev Transaction Details:')
      console.log('  Smart Wallet Address:', primaryWallet.address)
      console.log('  Recipient:', recipient)
      console.log('  Amount:', amount, 'ETH')
      console.log('  Wallet Client:', walletClient)
      
      // For ZeroDev smart wallets, the paymaster should be automatically used
      const txHash = await walletClient.sendTransaction({
        to: recipient as `0x${string}`,
        value: valueInWei,
        account: primaryWallet.address as `0x${string}`,
        // ZeroDev handles paymaster automatically for smart wallet transactions
      })

      // Get explorer URL for the current network
      const explorerUrl = getExplorerUrl(walletClient.chain?.id, txHash)
      const shortHash = `${txHash.slice(0, 10)}...${txHash.slice(-8)}`
      setMessage(`✅ Gasless transaction sent! Hash: ${shortHash}`)
      setLastTxHash(txHash)
      setLastNetworkId(walletClient.chain?.id || null)
      
      // Celebrate gasless success!
      celebrateSuccess('gasless')
      
      // Add to activity history
      addActivity({
        type: 'money_sent',
        title: 'Money Sent (Gasless)',
        description: 'Sent digital currency using Account Abstraction (no gas fees)',
        amount: `${amount} ETH`,
        recipient: recipient,
        status: 'completed',
        transactionHash: txHash,
        network: walletClient.chain?.name
      })
      
      setRecipient('')
      setAmount('')
    } catch (error) {
      console.error('Gasless transaction failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      if (errorMessage.includes('insufficient funds')) {
        setMessage(`❌ Insufficient funds. Your paymaster needs more ETH, or the smart wallet itself needs ETH for this transaction.`)
      } else {
        setMessage(`❌ Transaction failed: ${errorMessage}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGaslessNFTMint = async () => {
    if (!primaryWallet || !mintRecipient) {
      setMessage('Please connect wallet and provide recipient address')
      return
    }

    if (!isSmartWallet) {
      setMessage('Please connect with a ZeroDev smart wallet for gasless minting')
      return
    }

    try {
      setIsMinting(true)
      setMessage('Minting NFT with gasless transaction...')
      setLastTxHash('')
      setLastNetworkId(null)

      const walletClient = await (primaryWallet as any).getWalletClient()
      const currentChain = walletClient.chain

      // Contract addresses for our deployed NFTs
      const contractAddresses: Record<number, string> = {
        11155111: '0x742d35cc66ba4e98a1a7c45c9b6db6c2bd92b8d0', // Sepolia
        84532: '0x742d35cc66ba4e98a1a7c45c9b6db6c2bd92b8d0', // Base Sepolia
      }

      const contractAddress = contractAddresses[currentChain.id]
      if (!contractAddress) {
        throw new Error(`NFT contract not deployed on ${currentChain.name}`)
      }

      const DynamicNFTABI = [
        {
          name: 'mint',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [{ name: 'to', type: 'address' }],
          outputs: [],
        },
      ] as const

      const { encodeFunctionData } = await import('viem')
      const data = encodeFunctionData({
        abi: DynamicNFTABI,
        functionName: 'mint',
        args: [mintRecipient as `0x${string}`],
      })

      const txHash = await walletClient.sendTransaction({
        to: contractAddress as `0x${string}`,
        data: data,
        account: primaryWallet.address as `0x${string}`,
      })

      // Get explorer URL for the current network
      const explorerUrl = getExplorerUrl(currentChain.id, txHash)
      const shortHash = `${txHash.slice(0, 10)}...${txHash.slice(-8)}`
      setMessage(`✅ Gasless NFT minted! Hash: ${shortHash}`)
      setLastTxHash(txHash)
      setLastNetworkId(currentChain.id)
      
      // Celebrate gasless NFT success!
      celebrateSuccess('gasless')
      
      // Add to activity history
      addActivity({
        type: 'digital_asset_created',
        title: 'Digital Asset Created (Gasless)',
        description: 'Created a new digital collectible using Account Abstraction (no gas fees)',
        recipient: mintRecipient,
        status: 'completed',
        transactionHash: txHash,
        network: currentChain.name
      })
      
      setMintRecipient('')
    } catch (error) {
      console.error('Gasless minting failed:', error)
      setMessage(`❌ Minting failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsMinting(false)
    }
  }

  if (!primaryWallet) {
    return (
      <div className="aa-section">
        <p>Please connect your wallet to use Account Abstraction features</p>
      </div>
    )
  }

  const currentChainId = (primaryWallet as any).chain?.id
  const currentNetwork = supportedAANetworks.find(n => n.chainId === currentChainId)
  
  return (
    <div className="aa-section">
      <div className="aa-status-bar">
        <div className="status-left">
          <div className={`wallet-status-badge ${isSmartWallet ? 'smart' : 'regular'}`}>
            {isSmartWallet ? 'ZeroDev Smart Wallet Connected' : 'Regular Wallet - Switch to ZeroDev for Gasless Transactions'}
          </div>
        </div>
        <div className="status-right">
          {currentChainId && currentNetwork && (
            <div className="current-network">
              <span className="network-label">Current Network:</span>
              <span className={`network-badge ${currentNetwork.status}`}>
                {currentNetwork.name} ({currentNetwork.status === 'primary' ? 'AA Ready' : 'AA Supported'})
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="aa-deployment-info">
        <span className="deployment-text">Account Abstraction is currently deployed on Base Sepolia testnet</span>
        <span className="deployment-badge">Base Only</span>
      </div>

      {isSmartWallet && (
        <>
          <div className="aa-actions-grid">
            <div className="aa-action-card">
              <div className="action-header">
                <h3>Gasless Money Transfer</h3>
                <p>Send ETH without paying gas fees using Account Abstraction</p>
              </div>
              
              <div className="action-body">
                <div className="form-group">
                  <label>Recipient Address</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="0x..."
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Amount (ETH)</label>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.001"
                    className="form-input"
                  />
                </div>
                
                <button
                  onClick={handleGaslessTransfer}
                  disabled={isLoading || !recipient || !amount}
                  className="action-button primary"
                >
{isLoading ? 'Sending Transaction...' : 'Send Gasless Transaction'}
                </button>
              </div>
            </div>

            <div className="aa-action-card">
              <div className="action-header">
                <h3>Gasless NFT Minting</h3>
                <p>Mint NFTs without paying gas fees</p>
              </div>
              
              <div className="action-body">
                <div className="form-group">
                  <label>Mint to Address</label>
                  <input
                    type="text"
                    value={mintRecipient}
                    onChange={(e) => setMintRecipient(e.target.value)}
                    placeholder="0x..."
                    className="form-input"
                  />
                </div>
                
                <button
                  onClick={handleGaslessNFTMint}
                  disabled={isMinting || !mintRecipient}
                  className="action-button primary"
                >
{isMinting ? 'Minting NFT...' : 'Mint Gasless NFT'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="aa-info-section">
            <div className="info-with-tooltip">
              <span className="info-text">Gasless Transaction Requirements</span>
              <div className="info-tooltip-container">
                <span className="info-icon">ℹ️</span>
                <div className="tooltip">
                  <strong>How Gasless Transactions Work:</strong>
                  <p>Transactions are sponsored by your ZeroDev paymaster. If transactions fail with "insufficient funds", either the paymaster needs more ETH or the smart wallet itself needs a small amount of ETH for certain operations.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : message.includes('❌') ? 'error' : 'info'}`}>
          {message}
          {lastTxHash && lastNetworkId && message.includes('✅') && (
            <div style={{ marginTop: '8px' }}>
              <a 
                href={getExplorerUrl(lastNetworkId, lastTxHash) || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: '#007bff', 
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                View on {lastNetworkId === 84532 ? 'BaseScan' : 'Etherscan'} →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}