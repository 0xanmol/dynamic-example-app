import { useState } from 'react'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { useTransactionHistory } from '../contexts/TransactionContext'
import { celebrateSuccess } from '../utils/confetti'

// Embed the ABI directly for now (will be replaced with actual deployment)
const DynamicNFTABI = [
  {
    "type": "function",
    "name": "mint",
    "inputs": [{"name": "to", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "nonpayable"
  }
]

// Real deployed contracts
const NFT_CONTRACTS = {
  // Ethereum Sepolia
  11155111: '0x3DC2Afb921b2fe52B45382e0DAa9246F7046A71c',
  // Base Sepolia  
  84532: '0xfD8F6348867463FEb2C806EaEBA0E882b5cC2840'
}

const NFTMinter = () => {
  const { primaryWallet } = useDynamicContext()
  const { addActivity } = useTransactionHistory()
  const [recipient, setRecipient] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [networkId, setNetworkId] = useState<number | null>(null)

  const mintNFT = async () => {
    if (!primaryWallet || !recipient) return

    setIsLoading(true)
    try {
      console.log('Primary wallet:', primaryWallet)
      console.log('Wallet address:', primaryWallet.address)
      console.log('Wallet chain:', (primaryWallet.connector as any)?.chain)
      console.log('Available properties:', Object.keys(primaryWallet))
      
      // Use Dynamic's native wallet connector directly
      console.log('🔄 Trying Dynamic native wallet methods...')
      
      // Get the provider from Dynamic's wallet
      const walletClient = await (primaryWallet as any).getWalletClient()
      console.log('Dynamic wallet client:', walletClient)
      
      if (!walletClient) {
        throw new Error('No wallet client available from Dynamic')
      }
      
      // Get current chain info from the wallet client
      const currentChain = (walletClient as any).chain
      console.log('Current chain from wallet client:', currentChain)
      
      if (!currentChain) {
        throw new Error('No chain information available from wallet client')
      }
      
      console.log('🔍 NETWORK INFO:')
      console.log('   Chain ID:', currentChain.id)
      console.log('   Chain name:', currentChain.name)
      console.log('   Wallet address:', primaryWallet.address)
      
      // Check if we're on a supported network
      const supportedChains = [11155111, 84532] // Ethereum Sepolia, Base Sepolia
      if (!supportedChains.includes(currentChain.id)) {
        alert(`Unsupported network! Please switch to Ethereum Sepolia or Base Sepolia. Currently on: ${currentChain.name} (${currentChain.id})`)
        throw new Error(`Unsupported network: ${currentChain.name} (${currentChain.id})`)
      }
      
      // Get the contract address for the current network
      const contractAddress = NFT_CONTRACTS[currentChain.id as keyof typeof NFT_CONTRACTS]
      if (!contractAddress) {
        throw new Error(`No contract deployed on chain ${currentChain.id}`)
      }
      
      console.log('Using contract address:', contractAddress)
      
      // Create contract instance using viem (which Dynamic uses internally)
      const { createPublicClient, http } = await import('viem')
      
      createPublicClient({
        chain: currentChain,
        transport: http()
      })
      
      // Encode the mint function call
      const { encodeFunctionData } = await import('viem')
      const data = encodeFunctionData({
        abi: DynamicNFTABI,
        functionName: 'mint',
        args: [recipient]
      })
      
      // Send transaction using Dynamic's wallet client
      const txHash = await walletClient.sendTransaction({
        to: contractAddress,
        data: data,
        account: primaryWallet.address as `0x${string}`,
      })
      
      setTxHash(txHash)
      setNetworkId(currentChain.id)
      
      console.log('Minting NFT to:', recipient)
      console.log('Transaction hash:', txHash)
      console.log('Network:', currentChain.name)
      
      // Celebrate NFT creation!
      celebrateSuccess('nft')
      
      // Add to activity history
      addActivity({
        type: 'digital_asset_created',
        title: 'Digital Asset Created',
        description: 'Created a new digital collectible (NFT)',
        recipient: recipient,
        status: 'completed',
        transactionHash: txHash,
        network: currentChain.name
      })
      
    } catch (error) {
      console.error('Minting failed:', error)
      alert('Minting failed: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!primaryWallet) {
    return (
      <div className="nft-minter">
        <p>Please connect your wallet to mint NFTs</p>
      </div>
    )
  }

  return (
    <div className="nft-minter">
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
      
      <div className="info-box">
        <p>✅ Deployed to Ethereum Sepolia: {NFT_CONTRACTS[11155111]}</p>
        <p>✅ Deployed to Base Sepolia: {NFT_CONTRACTS[84532]}</p>
      </div>
      
      <button
        onClick={mintNFT}
        disabled={!recipient || isLoading}
        className="mint-btn"
      >
        {isLoading ? 'Minting...' : 'Mint NFT'}
      </button>
      
      {txHash && (
        <div className="tx-result">
          <p>NFT minted! Hash: {txHash.slice(0, 10)}...{txHash.slice(-8)}</p>
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

export default NFTMinter