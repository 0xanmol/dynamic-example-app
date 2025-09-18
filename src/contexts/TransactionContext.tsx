import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { transactionFetcher } from '../utils/transactionFetcher'

export interface ActivityItem {
  id: string
  type: 'money_sent' | 'digital_asset_created' | 'wallet_connected' | 'network_switched'
  title: string
  description: string
  amount?: string
  recipient?: string
  timestamp: Date
  status: 'completed' | 'pending' | 'failed'
  transactionHash?: string
  network?: string
}

interface TransactionContextType {
  activities: ActivityItem[]
  addActivity: (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => void
  refreshFromChain: (walletAddress: string, chainId: number) => Promise<void>
  isLoading: boolean
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export const useTransactionHistory = () => {
  const context = useContext(TransactionContext)
  if (!context) {
    throw new Error('useTransactionHistory must be used within a TransactionProvider')
  }
  return context
}

interface TransactionProviderProps {
  children: ReactNode
}

export const TransactionProvider = ({ children }: TransactionProviderProps) => {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('dynamic-transaction-history')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Convert timestamp strings back to Date objects
        const withDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
        setActivities(withDates)
      } catch (error) {
        console.warn('Failed to parse stored transaction history:', error)
      }
    }
  }, [])

  // Save to localStorage whenever activities change
  useEffect(() => {
    if (activities.length > 0) {
      localStorage.setItem('dynamic-transaction-history', JSON.stringify(activities))
    }
  }, [activities])

  const addActivity = (activityData: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newActivity: ActivityItem = {
      ...activityData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    }
    
    setActivities(prev => {
      // Check if transaction already exists (avoid duplicates)
      const existing = prev.find(a => a.transactionHash === newActivity.transactionHash)
      if (existing) return prev
      
      return [newActivity, ...prev] // Add to beginning for newest first
    })
  }

  const refreshFromChain = async (walletAddress: string, chainId: number) => {
    setIsLoading(true)
    try {
      console.log(`Refreshing transaction history for ${walletAddress} on chain ${chainId}`)
      
      const onChainActivities = await transactionFetcher.fetchTransactionHistory(
        walletAddress,
        chainId
      )
      
      // Merge on-chain data with local transactions, avoiding duplicates
      setActivities(prev => {
        const merged = [...onChainActivities]
        
        // Add local transactions that aren't on-chain yet (pending/recent)
        prev.forEach(localTx => {
          const existsOnChain = onChainActivities.find(
            chainTx => chainTx.transactionHash === localTx.transactionHash
          )
          if (!existsOnChain) {
            merged.push(localTx)
          }
        })
        
        // Sort by timestamp (newest first)
        merged.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        
        return merged
      })
      
    } catch (error) {
      console.error('Failed to refresh from chain:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TransactionContext.Provider value={{ activities, addActivity, refreshFromChain, isLoading }}>
      {children}
    </TransactionContext.Provider>
  )
}