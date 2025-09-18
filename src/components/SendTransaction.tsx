import { useState } from 'react'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { ethers } from 'ethers'

// Extend window object to include ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

const SendTransaction = () => {
  const { primaryWallet } = useDynamicContext()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [networkId, setNetworkId] = useState<number | null>(null)

  const sendTransaction = async () => {
    if (!primaryWallet || !recipient || !amount) return

    setIsLoading(true)
    try {
      console.log('Primary wallet:', primaryWallet)
      console.log('Dynamic wallet address:', primaryWallet.address)
      console.log('Dynamic wallet chain info:', primaryWallet.connector?.chain)
      console.log('Dynamic wallet network:', primaryWallet.network)
      console.log('Dynamic connector:', primaryWallet.connector)
      
      // Use Dynamic's native wallet methods (same as NFT minting)
      console.log('🔄 Using Dynamic native wallet methods...')
      
      // Get the wallet client from Dynamic
      const walletClient = await primaryWallet.getWalletClient()
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

  return (
    <div className="send-transaction">
      <div className="form-group">
        <label>Recipient Address:</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0xfa5c0bf0461e50ef24d6ace61536210c93f309be"
          className="form-input"
        />
      </div>
      
      <div className="form-group">
        <label>Amount (ETH):</label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.01"
          className="form-input"
        />
      </div>
      
      <button
        onClick={sendTransaction}
        disabled={!recipient || !amount || isLoading}
        className="send-btn"
      >
        {isLoading ? 'Sending...' : 'Send Transaction'}
      </button>
      
      {txHash && (
        <div className="tx-result">
          <p>Transaction Hash: {txHash}</p>
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