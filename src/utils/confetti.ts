import confetti from 'canvas-confetti'

export const celebrateSuccess = (type: 'money' | 'nft' | 'gasless' = 'money') => {
  // Different confetti patterns for different transaction types
  switch (type) {
    case 'money':
      // Gold/green confetti for money transfers
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#32CD32', '#00FF00', '#FFFF00']
      })
      break
      
    case 'nft':
      // Colorful artistic confetti for NFTs
      confetti({
        particleCount: 150,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
      })
      break
      
    case 'gasless':
      // Blue/purple premium confetti for gasless transactions
      confetti({
        particleCount: 120,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#667eea', '#764ba2', '#6B73FF', '#9D50BB', '#00d4ff']
      })
      // Add a second burst for extra premium feel
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 30,
          origin: { y: 0.7, x: 0.3 },
          colors: ['#667eea', '#764ba2']
        })
        confetti({
          particleCount: 50,
          spread: 30,
          origin: { y: 0.7, x: 0.7 },
          colors: ['#6B73FF', '#9D50BB']
        })
      }, 200)
      break
  }
}

export const celebrateConnection = () => {
  // Special animation for wallet connection
  confetti({
    particleCount: 80,
    spread: 50,
    origin: { y: 0.8 },
    colors: ['#00d4ff', '#0099cc', '#66ccff']
  })
}