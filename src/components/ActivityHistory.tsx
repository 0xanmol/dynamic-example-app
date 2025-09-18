import { useState, useEffect } from 'react'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { useTransactionHistory, type ActivityItem } from '../contexts/TransactionContext'

export default function ActivityHistory() {
  const { primaryWallet } = useDynamicContext()
  const { activities, refreshFromChain, isLoading } = useTransactionHistory()
  const [filter, setFilter] = useState<'all' | 'money_sent' | 'digital_asset_created'>('all')

  // Auto-fetch on-chain data when wallet connects
  useEffect(() => {
    if (primaryWallet?.address) {
      const walletClient = (primaryWallet as any).getWalletClient?.()
      if (walletClient) {
        walletClient.then((client: any) => {
          const chainId = client?.chain?.id
          if (chainId) {
            console.log('Auto-fetching transaction history for:', primaryWallet.address, 'on chain:', chainId)
            refreshFromChain(primaryWallet.address, chainId)
          }
        }).catch((error: any) => {
          console.warn('Could not get wallet client for auto-fetch:', error)
        })
      }
    }
  }, [primaryWallet?.address, refreshFromChain])

  const handleRefresh = async () => {
    if (!primaryWallet?.address) return
    
    try {
      const walletClient = await (primaryWallet as any).getWalletClient()
      const chainId = walletClient?.chain?.id
      if (chainId) {
        await refreshFromChain(primaryWallet.address, chainId)
      }
    } catch (error) {
      console.error('Manual refresh failed:', error)
    }
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'money_sent': return '💸'
      case 'digital_asset_created': return '🎨'
      case 'wallet_connected': return '🔗'
      case 'network_switched': return '🌐'
      default: return '📝'
    }
  }

  const getStatusColor = (status: ActivityItem['status']) => {
    switch (status) {
      case 'completed': return 'success'
      case 'pending': return 'warning'
      case 'failed': return 'error'
      default: return 'neutral'
    }
  }

  const getStatusText = (status: ActivityItem['status']) => {
    switch (status) {
      case 'completed': return 'Completed'
      case 'pending': return 'Processing'
      case 'failed': return 'Failed'
      default: return 'Unknown'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const getExplorerUrl = (network: string, txHash: string) => {
    const explorers: Record<string, string> = {
      'Base Sepolia': 'https://sepolia.basescan.org/tx/',
      'Ethereum Sepolia': 'https://sepolia.etherscan.io/tx/',
      'Polygon Amoy': 'https://amoy.polygonscan.com/tx/',
      'Arbitrum Sepolia': 'https://sepolia.arbiscan.io/tx/',
    }
    return explorers[network] ? `${explorers[network]}${txHash}` : null
  }

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.type === filter
  )

  const exportActivities = () => {
    const csvContent = [
      ['Date & Time', 'Activity', 'Description', 'Amount', 'Status', 'Network'],
      ...filteredActivities.map(activity => [
        activity.timestamp.toLocaleString(),
        activity.title,
        activity.description,
        activity.amount || '-',
        getStatusText(activity.status),
        activity.network || '-'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `activity-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!primaryWallet) {
    return (
      <div className="activity-section">
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>Connect Your Account</h3>
          <p>Connect your digital wallet to view your activity history</p>
        </div>
      </div>
    )
  }

  return (
    <div className="activity-section">
      <div className="activity-header">
        <div className="header-left">
          <h2>Your Activity History</h2>
          <p>Track all your digital transactions and actions</p>
          {activities.length > 0 && (
            <div style={{ fontSize: '0.85em', color: '#666', marginTop: '5px' }}>
              📡 Showing on-chain transactions + recent activity 
              {isLoading && <span style={{ color: '#007bff' }}> • Syncing...</span>}
            </div>
          )}
        </div>
        <div className="header-right">
          <button 
            onClick={handleRefresh} 
            disabled={isLoading}
            className={`export-button ${isLoading ? 'disabled' : ''}`}
          >
            {isLoading ? 'Syncing...' : 'Sync From Chain'}
          </button>
          <button onClick={exportActivities} className="export-button">
            Export Records
          </button>
        </div>
      </div>

      <div className="activity-filters">
        <button 
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Activities
        </button>
        <button 
          className={`filter-button ${filter === 'money_sent' ? 'active' : ''}`}
          onClick={() => setFilter('money_sent')}
        >
          Money Transfers
        </button>
        <button 
          className={`filter-button ${filter === 'digital_asset_created' ? 'active' : ''}`}
          onClick={() => setFilter('digital_asset_created')}
        >
          Digital Assets
        </button>
      </div>

      <div className="activity-list">
        {filteredActivities.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>No Activities Found</h3>
            <p>Start using the platform to see your activity history here</p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="activity-content">
                <div className="activity-main">
                  <h4 className="activity-title">{activity.title}</h4>
                  <p className="activity-description">{activity.description}</p>
                  
                  {activity.amount && (
                    <div className="activity-details">
                      <span className="detail-label">Amount:</span>
                      <span className="detail-value">{activity.amount}</span>
                    </div>
                  )}
                  
                  {activity.recipient && (
                    <div className="activity-details">
                      <span className="detail-label">Recipient:</span>
                      <span className="detail-value mono">{activity.recipient}</span>
                    </div>
                  )}
                </div>
                
                <div className="activity-meta">
                  <div className="meta-left">
                    <span className="timestamp">{formatTimestamp(activity.timestamp)}</span>
                    {activity.network && (
                      <span className="network-tag">{activity.network}</span>
                    )}
                  </div>
                  
                  <div className="meta-right">
                    <span className={`status-badge ${getStatusColor(activity.status)}`}>
                      {getStatusText(activity.status)}
                    </span>
                    
                    {activity.transactionHash && activity.network && (
                      <a 
                        href={getExplorerUrl(activity.network, activity.transactionHash) || '#'}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="view-details-link"
                      >
                        View Details ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}