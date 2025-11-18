# 🌐 Algorand-trix

🚀 **Your All-in-One AI DeFi Companion – Swap, Lend, Mint, and More with Just Prompts!**

---

## 📌 Overview  

**Algorand-trix** is an advanced **AI-powered DeFi assistant** designed to simplify and enhance interactions in decentralized finance (DeFi).  
From **swapping tokens, lending, minting NFTs/tokens, cross-chain strategies, to exploring developer tools**—everything can be done effortlessly with **natural language prompts**.  

It's **fully on-chain, developer-oriented, and authority-first**—meaning **you remain in full control** of your assets and actions.

---

## ✨ Features  

- 🔄 **Swap** – Instantly swap tokens with on-chain execution.  
- 💸 **Lend** – Lend assets securely and earn yields.  
- 📈 **Trade** – Execute trades on Algorand and beyond.  
- 🎨 **Mint** – Create NFTs easily with prompt-based generation.  
- 🪙 **Mint Token** – Launch and configure your own tokens.  
- 📤 **Transfer Token** – Send tokens securely, fully on-chain.  
- 🔗 **Transfer Native Token** – Move ALGO or other native assets effortlessly.  
- 📊 **Get Quotes** – Fetch best quotes and prices across protocols.  
- 🌉 **Cross-Chain** – Execute cross-chain swaps, bridging, and transfers.  
- ⚡ **Generate** – AI-assisted generation for NFTs, assets, and strategies.  
- 🤖 **Algorand Helper** – Learn about RPCs, indexers, account abstraction, oracles, and more with AI-driven explanations.

---

## 🛠️ Supported Tabs  

```ts
type TabType =
  | "general"
  | "swap"
  | "lend"
  | "trade"
  | "mint"
  | "mint-token"
  | "transfer-token"
  | "transfer-native-token"
  | "get-quotes"
  | "cross-chain"
  | "generate"
  | "algorand-helper";
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm**, **yarn**, **pnpm**, or **bun** (package manager)
- **Git** (for cloning the repository)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Algorand-trix/algorand-trix
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the `algorand-trix` directory with the following variables:

```env
# AI/LLM Configuration
HYPERBOLIC_API_KEY=your_hyperbolic_api_key_here

# Image Generation (for NFT minting)
VENICE_API_KEY=your_venice_api_key_here
VENICE_API_BASE_URL=https://api.venice.ai/v1/generate

# IPFS Storage (for NFT metadata and images)
FILEBASE_API_KEY=your_filebase_api_key_here

# Blockchain Configuration
RPC_URL=your_rpc_url_here

# Wallet Configuration (for NFT minting operations)
WALLET_PRIVATE_KEY=your_wallet_private_key_here
```

**Note:** 
- Get your Hyperbolic API key from [Hyperbolic.xyz](https://hyperbolic.xyz)
- Get your Venice API key from [Venice AI](https://venice.ai) (for image generation)
- Get your Filebase API key from [Filebase](https://filebase.com) (for IPFS storage)
- Use your preferred RPC provider URL (e.g., Alchemy, Infura, or a custom RPC endpoint)
- The `WALLET_PRIVATE_KEY` is used for server-side operations like NFT minting

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

Open your browser and navigate to the URL to see the application.

### 5. Build for Production

```bash
npm run build
npm run start
# or
yarn build
yarn start
# or
pnpm build
pnpm start
```

---

## 🏗️ Project Structure

```
algorand-trix/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── ai-process/    # AI processing endpoints
│   │   │   ├── cross-chain/   # Cross-chain operations
│   │   │   ├── lending/       # Lending operations
│   │   │   ├── nft/           # NFT minting
│   │   │   ├── quotes/        # Price quotes
│   │   │   ├── swap-cow/      # CowSwap integration
│   │   │   └── ...
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── AIAgent.tsx        # Main AI agent component
│   │   ├── AlgorandWallet.tsx # Wallet connection
│   │   └── ui/                # UI components
│   ├── lib/                   # Utility libraries
│   │   ├── abi.ts             # Contract ABIs
│   │   ├── constants.ts       # Constants
│   │   ├── db.ts              # Database connection
│   │   └── filebase.ts        # IPFS/filebase integration
│   ├── models/                # Data models
│   └── utils/                 # Utility functions
│       ├── ai.ts              # AI/LLM utilities
│       ├── img-gen.ts         # Image generation
│       └── prompt.ts          # Prompt handling
├── public/                    # Static assets
├── package.json               # Dependencies
├── next.config.ts             # Next.js configuration
└── tailwind.config.ts         # Tailwind CSS configuration
```

---

## 🔧 Technology Stack

- **Framework:** Next.js 15.1.6 (React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Blockchain:** 
  - Algorand SDK (`algosdk`, `@txnlab/use-wallet-react`)
  - Ethereum/EVM (`ethers`, `viem`, `wagmi`)
- **AI/ML:** OpenAI API (via Hyperbolic)
- **Wallets:** 
  - Defly, Pera, WalletConnect, KMD, Kibisis, Lute, Magic
- **State Management:** TanStack Query (React Query)
- **UI Components:** Radix UI, shadcn/ui

---

## 🔐 Wallet Configuration

The application supports multiple Algorand wallet providers:

- **Defly Wallet**
- **Pera Wallet**
- **WalletConnect** (Project ID: `86a36faefc623df46385759a9ed566ac`)
- **Biatec** (Project ID: `fcfde0713d43baa0d23be0773c80a72b`)
- **KMD** (Kibble)
- **Kibisis**
- **Lute**
- **Magic** (API Key: `pk_live_E8C27696B36E9AF8`)

**Default Network:** Testnet

To change the network, modify the `defaultNetwork` in `src/app/page.tsx`.

---

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

---

## 🧪 Testing

Connect your wallet and try these example prompts:

- "Swap 10 ALGO to USDC"
- "Lend 100 ALGO on Folks Finance"
- "Mint an NFT with the prompt 'A futuristic cityscape'"
- "Get quotes for swapping ALGO to ETH"
- "How do I set up an Algorand RPC?"

---

## ⚠️ Important Notes

1. **Environment Variables:** Never commit your `.env.local` file. It contains sensitive API keys and private keys.

2. **Network:** The application is configured for **Testnet** by default. Change this in production.

3. **Private Keys:** The `WALLET_PRIVATE_KEY` is used for server-side operations. Use a dedicated wallet for this purpose, not your main wallet.

4. **API Keys:** Ensure all required API keys are valid and have sufficient credits/quota.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary.

---

## 🆘 Troubleshooting

### Issue: "OpenAI API key is missing"
- **Solution:** Ensure `HYPERBOLIC_API_KEY` is set in your `.env.local` file.

### Issue: "Venice API key or URL is missing"
- **Solution:** Add both `VENICE_API_KEY` and `VENICE_API_BASE_URL` to your `.env.local` file.

### Issue: Wallet connection fails
- **Solution:** Check that your wallet extension is installed and unlocked. For WalletConnect, ensure the project ID is correct.

### Issue: Build errors
- **Solution:** Clear `.next` folder and `node_modules`, then reinstall dependencies:
  ```bash
  rm -rf .next node_modules
  npm install
  ```

---

## 📞 Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Built with ❤️ for the Algorand ecosystem**
