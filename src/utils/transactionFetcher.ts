import { createPublicClient, http, getAddress, formatEther } from 'viem'
import { mainnet, sepolia, base, baseSepolia } from 'viem/chains'
import type { ActivityItem } from '../contexts/TransactionContext'

// Chain configurations
const CHAINS = {
  1: mainnet,
  11155111: sepolia,
  8453: base,
  84532: baseSepolia,
}

// Known contract addresses for NFT detection
const NFT_CONTRACTS = {
  11155111: '0x3DC2Afb921b2fe52B45382e0DAa9246F7046A71c'.toLowerCase(),
  84532: '0xfD8F6348867463FEb2C806EaEBA0E882b5cC2840'.toLowerCase(),
}

export interface OnChainTransaction {
  hash: string
  from: string
  to: string | null
  value: bigint
  blockNumber: bigint
  timestamp: number
  input: string
  status: 'success' | 'reverted'
}

export class TransactionFetcher {
  private clients: Map<number, any> = new Map()

  private getClient(chainId: number) {
    if (!this.clients.has(chainId)) {
      const chain = CHAINS[chainId as keyof typeof CHAINS]
      if (!chain) throw new Error(`Unsupported chain: ${chainId}`)
      
      const client = createPublicClient({
        chain,
        transport: http()
      })
      this.clients.set(chainId, client)
    }
    return this.clients.get(chainId)
  }

  async fetchTransactionHistory(
    walletAddress: string, 
    chainId: number,
    fromBlock: bigint = 0n
  ): Promise<ActivityItem[]> {
    try {
      const client = this.getClient(chainId)
      const address = getAddress(walletAddress)
      
      // Get latest block number
      const latestBlock = await client.getBlockNumber()
      const startBlock = fromBlock || (latestBlock - 10000n) // Last ~10k blocks
      
      console.log(`Fetching transactions for ${address} on chain ${chainId} from block ${startBlock}`)
      
      // Get transaction receipts for this address
      const transactions = await this.getAddressTransactions(client, address, startBlock, latestBlock)
      
      // Convert to ActivityItem format
      const activities: ActivityItem[] = []
      
      for (const tx of transactions) {
        const block = await client.getBlock({ blockNumber: tx.blockNumber })
        const timestamp = new Date(Number(block.timestamp) * 1000)
        
        // Determine transaction type
        const isNFTTransaction = this.isNFTTransaction(tx, chainId)
        const isOutgoing = tx.from.toLowerCase() === address.toLowerCase()
        
        if (isNFTTransaction) {
          activities.push({
            id: tx.hash,
            type: 'digital_asset_created',
            title: 'Digital Asset Created',
            description: 'Created a new digital collectible (NFT)',
            recipient: tx.to || 'Unknown',
            timestamp,
            status: tx.status === 'success' ? 'completed' : 'failed',
            transactionHash: tx.hash,
            network: this.getNetworkName(chainId)
          })
        } else if (tx.value > 0n) {
          // ETH transfer
          const amount = formatEther(tx.value)
          activities.push({
            id: tx.hash,
            type: 'money_sent',
            title: isOutgoing ? 'Money Sent' : 'Money Received',
            description: isOutgoing 
              ? 'Sent digital currency to another account'
              : 'Received digital currency from another account',
            amount: `${amount} ETH`,
            recipient: isOutgoing ? tx.to || 'Unknown' : tx.from,
            timestamp,
            status: tx.status === 'success' ? 'completed' : 'failed',
            transactionHash: tx.hash,
            network: this.getNetworkName(chainId)
          })
        }
      }
      
      // Sort by timestamp (newest first)
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      
      console.log(`Found ${activities.length} activities for ${address}`)
      return activities
      
    } catch (error) {
      console.error('Error fetching transaction history:', error)
      return []
    }
  }

  private async getAddressTransactions(
    client: any,
    address: string,
    fromBlock: bigint,
    toBlock: bigint
  ): Promise<OnChainTransaction[]> {
    try {
      // For demo purposes, we'll use a simplified approach
      // In production, you'd want to use a dedicated indexing service like Alchemy/Moralis
      
      const transactions: OnChainTransaction[] = []
      
      // Get recent blocks and check for transactions involving this address
      const blockRange = Math.min(Number(toBlock - fromBlock), 1000) // Limit to avoid rate limits
      
      for (let i = 0; i < blockRange; i += 100) {
        const currentBlock = fromBlock + BigInt(i)
        
        try {
          const block = await client.getBlock({ 
            blockNumber: currentBlock,
            includeTransactions: true 
          })
          
          for (const tx of block.transactions) {
            if (typeof tx === 'string') continue // Skip if only hash
            
            const txReceipt = await client.getTransactionReceipt({ hash: tx.hash })
            
            // Check if transaction involves our address
            const isRelevant = 
              tx.from?.toLowerCase() === address.toLowerCase() ||
              tx.to?.toLowerCase() === address.toLowerCase()
            
            if (isRelevant) {
              transactions.push({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: tx.value,
                blockNumber: tx.blockNumber,
                timestamp: Number(block.timestamp),
                input: tx.input,
                status: txReceipt.status === 'success' ? 'success' : 'reverted'
              })
            }
          }
        } catch (error) {
          console.warn(`Error fetching block ${currentBlock}:`, error)
          continue
        }
      }
      
      return transactions
      
    } catch (error) {
      console.error('Error in getAddressTransactions:', error)
      return []
    }
  }

  private isNFTTransaction(tx: OnChainTransaction, chainId: number): boolean {
    const knownNFTContract = NFT_CONTRACTS[chainId as keyof typeof NFT_CONTRACTS]
    return tx.to?.toLowerCase() === knownNFTContract
  }

  private getNetworkName(chainId: number): string {
    const names: Record<number, string> = {
      1: 'Ethereum Mainnet',
      11155111: 'Ethereum Sepolia',
      8453: 'Base',
      84532: 'Base Sepolia',
    }
    return names[chainId] || `Chain ${chainId}`
  }
}

export const transactionFetcher = new TransactionFetcher()