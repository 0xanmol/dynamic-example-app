# Enterprise Web3 Wallet Integration Demo

A comprehensive demonstration of Dynamic Labs' enterprise-grade Web3 wallet infrastructure, showcasing embedded wallets, multi-chain support, and Account Abstraction for seamless user experiences.

## 🚀 Live Demo Features

### Core Capabilities
- **🔐 Embedded Wallet Creation** - Users can create wallets without external wallet apps
- **🌐 Multi-Chain Support** - Seamlessly switch between Ethereum Sepolia and Base Sepolia
- **⚡ Account Abstraction** - Gasless transactions via ZeroDev smart wallets
- **🎨 NFT Minting** - Real smart contract deployment with embedded metadata
- **💸 Simple Money Transfer** - Clean UX for sending transactions
- **📱 Mobile-First Design** - Optimized for users without traditional wallets

### Enterprise Solutions Demonstrated

#### 1. Wallet Infrastructure
- Native embedded wallet creation through Dynamic Labs SDK
- Support for external wallet connections (MetaMask, WalletConnect, etc.)
- Seamless switching between wallet types

#### 2. Multi-Chain Architecture
- Real deployments on Ethereum Sepolia and Base Sepolia testnets
- Automatic network detection and switching
- Consistent UX across different blockchains

#### 3. Account Abstraction (AA)
- ZeroDev smart wallet integration
- Gasless transaction capabilities
- Enhanced user experience for Web2 users

#### 4. Security & Authentication
- OAuth social authentication (Google, etc.)
- MFA-ready infrastructure
- Secure key management through Dynamic Labs

#### 5. Developer Experience
- TypeScript for type safety
- Modern React patterns with hooks
- Clean component architecture
- Professional UI/UX design

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Wallet SDK**: Dynamic Labs SDK v4.32.0
- **Account Abstraction**: ZeroDev Smart Wallets
- **Blockchain Interaction**: Viem (modern web3 library)
- **Smart Contracts**: Solidity + Foundry
- **Styling**: Custom CSS with responsive design
- **Networks**: Ethereum Sepolia, Base Sepolia (testnets only)

## 📦 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/0xanmol/dynamic-example-app.git
   cd dynamic-example-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   VITE_DYNAMIC_ENVIRONMENT_ID=your-dynamic-environment-id
   VITE_ZERODEV_PROJECT_ID=your-zerodev-project-id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration Guide

### Dynamic Labs Setup

1. **Create Account**: Visit [Dynamic Labs Dashboard](https://app.dynamic.xyz/dashboard)
2. **Create Environment**: Set up a new environment for your application
3. **Configure Wallet Connectors**: Enable Ethereum and ZeroDev connectors
4. **Get Environment ID**: Copy your environment ID to the `.env` file

### ZeroDev Configuration

1. **Create Account**: Visit [ZeroDev Dashboard](https://dashboard.zerodev.app/)
2. **Create Project**: Set up a new project for Account Abstraction
3. **Configure Networks**: Enable Ethereum Sepolia and Base Sepolia
4. **Get Project ID**: Copy your project ID to the `.env` file

### Network Configuration

The demo is configured for **testnets only**:
- **Ethereum Sepolia**: ETH testnet with extensive tooling
- **Base Sepolia**: Base Layer 2 testnet for faster, cheaper transactions

## 🎯 Usage Guide

### For End Users

1. **Authentication**
   - Connect with social auth (Google) or external wallets
   - Create an embedded wallet directly in the browser
   - No prior Web3 experience required

2. **Multi-Chain Operations**
   - Switch between Ethereum Sepolia and Base Sepolia
   - Consistent experience across networks
   - Automatic network detection

3. **NFT Minting**
   - Mint real NFTs to any address
   - Embedded SVG metadata
   - Works on both supported networks

4. **Money Transfer**
   - Send ETH with simple, clean UX
   - Real-time transaction feedback
   - Mobile-optimized interface

5. **Account Abstraction**
   - Connect with ZeroDev smart wallets
   - Experience gasless transactions
   - Enterprise-grade UX for Web2 users

### For Developers

#### Smart Contract Integration
```typescript
// Example: Minting NFTs
const walletClient = await primaryWallet.getWalletClient()
const txHash = await walletClient.sendTransaction({
  to: contractAddress,
  data: encodeFunctionData({
    abi: contractABI,
    functionName: 'mint',
    args: [recipient]
  }),
  account: primaryWallet.address,
})
```

#### Account Abstraction
```typescript
// Check if user has smart wallet
const isSmartWallet = primaryWallet?.connector?.name?.includes('ZeroDev')

// Send gasless transaction
if (isSmartWallet) {
  const txHash = await walletClient.sendTransaction({
    to: recipient,
    value: parseEther(amount),
    account: primaryWallet.address,
  })
}
```

## 🏗 Project Structure

```
src/
├── components/
│   ├── AccountAbstraction.tsx    # AA features and smart wallet detection
│   ├── NFTMinter.tsx            # Real NFT minting functionality
│   └── SendTransaction.tsx      # Money transfer component
├── contracts/
│   └── src/
│       └── DynamicNFT.sol      # ERC721 NFT contract
├── App.tsx                     # Main application with tab navigation
├── main.tsx                    # Dynamic Labs SDK configuration
└── App.css                     # Responsive styling and design system
```

## 🚦 Smart Contract Deployments

### Ethereum Sepolia
- **Contract Address**: `0x742d35cc66ba4e98a1a7c45c9b6db6c2bd92b8d0`
- **Network ID**: 11155111
- **Explorer**: [Etherscan Sepolia](https://sepolia.etherscan.io/)

### Base Sepolia  
- **Contract Address**: `0x742d35cc66ba4e98a1a7c45c9b6db6c2bd92b8d0`
- **Network ID**: 84532
- **Explorer**: [BaseScan Sepolia](https://sepolia.basescan.org/)

## 📱 Mobile Experience

This demo is specifically optimized for mobile users who are new to Web3:

- **Responsive Design**: Works seamlessly on all screen sizes
- **Touch-Friendly**: Large buttons and intuitive interactions
- **No Wallet Required**: Users can create embedded wallets instantly
- **Account Abstraction**: Gasless transactions remove friction
- **Clean UX**: Minimal, professional interface

## 🔍 Testing Guide

### Manual Testing Checklist

#### Authentication Flow
- [ ] Social authentication (Google)
- [ ] Embedded wallet creation
- [ ] External wallet connection
- [ ] User session persistence

#### Multi-Chain Operations
- [ ] Network switching via dropdown
- [ ] Contract interactions on both networks
- [ ] Balance updates after network switch

#### NFT Minting
- [ ] Successful mints on Ethereum Sepolia
- [ ] Successful mints on Base Sepolia
- [ ] Error handling for invalid addresses
- [ ] Transaction confirmation feedback

#### Money Transfer
- [ ] ETH transfers on both networks
- [ ] Input validation
- [ ] Transaction status updates
- [ ] Error handling

#### Account Abstraction
- [ ] Smart wallet connection
- [ ] Gasless transaction execution
- [ ] Regular wallet fallback behavior
- [ ] Status indicator accuracy

#### Mobile Experience
- [ ] Responsive layout on mobile devices
- [ ] Touch interactions work properly
- [ ] Readable text and UI elements
- [ ] Proper form input behavior

## 🚀 Deployment

### Development
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Production Deployment
This project is ready for deployment on:
- **Vercel**: Zero-config deployment with automatic builds
- **Netlify**: Simple drag-and-drop or Git integration  
- **AWS S3 + CloudFront**: Custom domain with CDN
- **Any static hosting provider**

### Environment Variables for Production
```env
VITE_DYNAMIC_ENVIRONMENT_ID=your-production-environment-id
VITE_ZERODEV_PROJECT_ID=your-production-zerodev-project-id
```

## 📈 Performance & Best Practices

### Implemented Optimizations
- **Code Splitting**: Automatic route-based splitting via Vite
- **Tree Shaking**: Unused code elimination
- **Modern Bundle**: ES modules for faster loading
- **Responsive Images**: Optimized for different screen sizes
- **Lazy Loading**: Components loaded on demand

### Security Best Practices
- **No Private Keys**: All sensitive data handled by Dynamic Labs
- **Environment Variables**: Configuration via environment variables only
- **HTTPS Only**: Secure communication protocols
- **Input Validation**: Client-side validation for user inputs

## 🤝 Contributing

This demo represents enterprise-ready patterns for Web3 integration. Key principles:

1. **User Experience First**: Every feature prioritizes end-user simplicity
2. **Mobile-First**: Design for users without traditional wallets
3. **Real Implementations**: No mocks or simulated functionality
4. **Enterprise Standards**: Production-ready code quality
5. **Comprehensive Testing**: Manual and automated testing coverage

## 📋 Frequently Asked Questions

### General Questions

**Q: What makes this different from other Web3 demos?**
A: This demo uses real smart contracts, real testnets, and real Account Abstraction. No mocked functionality - everything works exactly as it would in production.

**Q: Why testnets only?**
A: This ensures safe testing without real financial risk while demonstrating full functionality that would work identically on mainnet.

**Q: Can I use this code in production?**
A: Yes, this code follows production-ready patterns. Simply update environment variables and deploy to mainnet networks when ready.

### Technical Questions

**Q: How does Account Abstraction work here?**
A: ZeroDev smart wallets are integrated through Dynamic Labs, enabling gasless transactions and enhanced UX for users unfamiliar with Web3.

**Q: What happens if ZeroDev is unavailable?**
A: The app gracefully falls back to regular wallet functionality, maintaining full compatibility with traditional Web3 flows.

**Q: How are private keys managed?**
A: Dynamic Labs handles all key management securely. No private keys are stored in the application code or environment variables.

### Business Questions

**Q: What enterprise problems does this solve?**
A: The 5 core issues: embedded wallet infrastructure, multi-chain support, Account Abstraction for user onboarding, enterprise security, and clear transaction UX.

**Q: How does this scale for enterprise use?**
A: Dynamic Labs provides enterprise-grade infrastructure with proper user management, analytics, and compliance tools.

**Q: What's the cost structure?**
A: Dynamic Labs offers usage-based pricing. Account Abstraction costs depend on gas sponsorship requirements and can be optimized per use case.

## 📞 Support & Resources

### Dynamic Labs Resources
- [Documentation](https://docs.dynamic.xyz/)
- [Dashboard](https://app.dynamic.xyz/dashboard)
- [Community Discord](https://discord.com/invite/dynamic)

### ZeroDev Resources  
- [Documentation](https://docs.zerodev.app/)
- [Dashboard](https://dashboard.zerodev.app/)
- [GitHub](https://github.com/zerodevapp)

### General Web3 Development
- [Viem Documentation](https://viem.sh/)
- [Foundry Documentation](https://book.getfoundry.sh/)
- [Ethereum Sepolia Faucet](https://sepoliafaucet.com/)
- [Base Sepolia Faucet](https://bridge.base.org/)

---

**Built with 💙 using Dynamic Labs SDK**

*This demo showcases enterprise-grade Web3 infrastructure for seamless user onboarding and multi-chain operations.*
