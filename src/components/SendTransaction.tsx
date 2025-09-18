import { useState } from 'react'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { useTransactionHistory } from '../contexts/TransactionContext'
import { celebrateSuccess } from '../utils/confetti'

const SendTransaction = () => {
  const { primaryWallet } = useDynamicContext()
  const { addActivity } = useTransactionHistory()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [networkId, setNetworkId] = useState<number | null>(null)

  const isSmartWallet = primaryWallet?.connector?.name?.includes('ZeroDev')

  const sendTransaction = async () => {
    if (!primaryWallet || !recipient || !amount) return

    setIsLoading(true)
    try {
      console.log('Primary wallet:', primaryWallet)
      console.log('Dynamic wallet address:', primaryWallet.address)
      console.log('Dynamic wallet chain info:', (primaryWallet.connector as any)?.chain)
      console.log('Dynamic wallet network:', (primaryWallet as any).network)
      console.log('Dynamic connector:', primaryWallet.connector)
      
      // Use Dynamic's native wallet methods (same as NFT minting)
      console.log('🔄 Using Dynamic native wallet methods...')
      
      // Get the wallet client from Dynamic
      const walletClient = await (primaryWallet as any).getWalletClient()
      console.log('Dynamic wallet client:', walletClient)
      
      if (!walletClient) {
        throw new Error('No wallet client available from Dynamic')
      }
      
      // Get current chain info from the wallet client
      const currentChain = walletClient.chain
      console.log('Current chain from wallet client:', currentChain)
      
      if (!currentChain) {
        throw new Error('No chain information available from wallet client')
      }
      
      console.log('🔍 NETWORK INFO:')
      console.log('   Chain ID:', currentChain.id)
      console.log('   Chain name:', currentChain.name)
      console.log('   Wallet address:', primaryWallet.address)
      
      // Convert amount to wei using viem's parseEther
      const { parseEther } = await import('viem')
      const valueInWei = parseEther(amount)
      console.log('Sending transaction:', { to: recipient, value: valueInWei.toString() })
      
      // Send the transaction using Dynamic's wallet client
      const txHash = await walletClient.sendTransaction({
        to: recipient as `0x${string}`,
        value: valueInWei,
        account: primaryWallet.address as `0x${string}`,
      })
      
      setTxHash(txHash)
      setNetworkId(currentChain.id)
      console.log('Transaction sent:', txHash)
      console.log('Network:', currentChain.name)
      
      // Celebrate success!
      celebrateSuccess('money')
      
      // Add to activity history
      addActivity({
        type: 'money_sent',
        title: 'Money Sent',
        description: 'Sent digital currency to another account',
        amount: `${amount} ETH`,
        recipient: recipient,
        status: 'completed',
        transactionHash: txHash,
        network: currentChain.name
      })
      
    } catch (error) {
      console.error('Transaction failed:', error)
      alert('Transaction failed: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!primaryWallet) {
    return (
      <div className="send-transaction">
        <p>Please connect your wallet to send transactions</p>
      </div>
    )
  }

  if (isSmartWallet) {
    return (
      <div className="send-transaction">
        <div className="smart-wallet-notice">
          <div className="notice-header">
            <span className="notice-icon">ℹ️</span>
            <h3>Smart Wallet Detected</h3>
          </div>
          <p>You're connected with a ZeroDev smart wallet. For <strong>gasless transactions</strong>, please use the <strong>Account Abstraction</strong> tab instead.</p>
          <p>This tab is designed for regular wallets that require manual gas fee payments.</p>
        </div>
        
        <div className="regular-transaction-section">
          <h4>Send Regular Transaction (with gas fees)</h4>
          <p className="gas-warning">⚠️ This will require you to pay gas fees manually</p>
          
          <div className="form-group">
            <label>Recipient Address:</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Amount (ETH):</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.001"
              className="form-input"
            />
          </div>
          <button 
            onClick={sendTransaction} 
            disabled={isLoading || !recipient || !amount}
            className="send-btn warning"
          >
{isLoading ? 'Sending...' : 'Send with Gas Fees'}
          </button>
        </div>
        
        {txHash && (
          <div className="tx-result">
            <p>Regular transaction sent! Hash: {txHash.slice(0, 10)}...{txHash.slice(-8)}</p>
            <a 
              href={networkId === 84532 
                ? `https://sepolia.basescan.org/tx/${txHash}`
                : `https://sepolia.etherscan.io/tx/${txHash}`
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              View on {networkId === 84532 ? 'BaseScan' : 'Etherscan'}
            </a>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="send-transaction">
      <div className="regular-wallet-info">
        <div className="wallet-type-badge">
          <span className="badge-icon">🔑</span>
          <span>Regular Wallet - Gas fees required</span>
        </div>
      </div>
      
      <div className="form-group">
        <label>Recipient Address:</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          className="form-input"
        />
      </div>
      
      <div className="form-group">
        <label>Amount (ETH):</label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.001"
          className="form-input"
        />
      </div>
      
      <button
        onClick={sendTransaction}
        disabled={!recipient || !amount || isLoading}
        className="send-btn"
      >
{isLoading ? 'Sending...' : 'Send Transaction (Gas Required)'}
      </button>
      
      {txHash && (
        <div className="tx-result">
          <p>Transaction Hash: {txHash.slice(0, 10)}...{txHash.slice(-8)}</p>
          <a 
            href={networkId === 84532 
              ? `https://sepolia.basescan.org/tx/${txHash}`
              : `https://sepolia.etherscan.io/tx/${txHash}`
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            View on {networkId === 84532 ? 'BaseScan' : 'Etherscan'}
          </a>
        </div>
      )}
    </div>
  )
}

export default SendTransaction