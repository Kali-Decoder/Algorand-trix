# 🌐 Algorand-trix

🚀 **Your All-in-One AI DeFi Companion – Swap, Lend, Mint, and More with Just Prompts!**

---

## 📌 Overview  

**Algorand-trix** is an advanced **AI-powered DeFi assistant** designed to simplify and enhance interactions in decentralized finance (DeFi).  
From **swapping tokens, lending, minting NFTs/tokens, cross-chain strategies, to exploring developer tools**—everything can be done effortlessly with **natural language prompts**.  

It's **fully on-chain, developer-oriented, and authority-first**—meaning **you remain in full control** of your assets and actions.

---

## ✨ Features  

### Core DeFi Operations 
- 💸 **Lend** – Lend assets securely and earn yields. Get AI-powered recommendations for lending protocols based on TVL, APY, and security factors.  
- 📈 **Trade** – Execute trades on Algorand and beyond. Access DEX trading data and get best trading opportunities with liquidity and volume analysis.  
- 📊 **Get Quotes** – Fetch best quotes and prices across multiple protocols and DEXs. Compare rates before executing trades.  

### Token & Asset Management
- 🪙 **Mint Token** – Launch and configure your own tokens on Algorand. Create custom tokens with full control over parameters.  
- 📤 **Transfer Token** – Send tokens securely, fully on-chain. Transfer any Algorand Standard Asset (ASA) to any address.  
- 🔗 **Transfer Native Token** – Move ALGO or other native assets effortlessly between addresses.  

### NFT Operations
- 🎨 **Mint NFT** – Create NFTs easily with AI-powered prompt-based image generation. Generate unique artwork from text descriptions and mint directly to the blockchain.  
- 🏷️ **NFD Names** – Resolve Algorand addresses to NFD (Name) names, perform reverse lookups, and discover all NFDs associated with an address.  

### Developer Tools
- 💻 **Coding Helper** – Generate integration functions from smart contract ABIs. Automatically create TypeScript/JavaScript functions for interacting with any contract.  
- 🤖 **Algorand Helper** – Learn about RPCs, indexers, account abstraction, oracles, DeFi protocols, wallet infrastructure, and more with AI-driven explanations.  
- 🌐 **Ecosystem Projects Explorer** – Discover and explore Algorand ecosystem projects. Search by category, find projects with GitHub repositories, and get detailed information about tools, wallets, DEXs, and more.  

### AI & Automation
- ⚡ **AI-Powered Prompts** – All operations can be executed using natural language. The AI understands your intent and executes the appropriate blockchain operations.  
- 🧠 **General Assistant** – Ask questions, get information, and receive guidance on DeFi operations, blockchain concepts, and more.

---

## 🛠️ Supported Tabs  

The application provides multiple specialized tabs for different operations. Some tabs require wallet connection, while others (General, Ecosystem Projects, NFD Names) are available without connecting a wallet.

```ts
type TabType =
  | "general"                    // General AI assistant (no wallet required)
  | "generate"                   // Coding Helper - Generate functions from ABIs
  | "mint-token"                 // Mint custom tokens (wallet required)
  | "lend"                       // Lending operations (wallet required)
  | "trade"                      // Trading operations (wallet required)
  | "get-quotes"                 // Get price quotes (wallet required)
  | "transfer-native-token"      // Transfer ALGO (wallet required)
  | "transfer-token"             // Transfer ASAs (wallet required)
  | "mint"                       // Mint NFTs (wallet required)
  | "algorand-helper"            // Algorand ecosystem knowledge (no wallet required)
  | "ecosystem-project"          // Explore Algorand projects (no wallet required)
  | "nfd-names";                 // NFD name resolution (no wallet required)
```

### Tab Descriptions

- **General** - Ask any DeFi or blockchain-related questions. Get AI-powered responses and guidance.
- **Coding Helper** - Generate integration functions from contract ABIs. Simply provide an ABI JSON and get ready-to-use TypeScript functions.
- **Mint Tokens** - Create and deploy custom tokens on Algorand with configurable parameters.
- **Lending** - Get AI-analyzed lending protocol recommendations with TVL, APY, and risk assessments.
- **Trading** - Access DEX trading data and receive best trading opportunities with liquidity analysis.
- **Get Quotes** - Compare prices and quotes across multiple protocols before executing trades.
- **Transfer ALGO** - Send native ALGO tokens to any Algorand address.
- **Transfer Tokens** - Transfer any Algorand Standard Asset (ASA) to other addresses.
- **Mint** - Generate NFT images from text prompts using AI and mint them to the blockchain.
- **Algorand Helper** - Learn about Algorand infrastructure: RPCs, indexers, oracles, account abstraction, DeFi protocols, and wallet infrastructure.
- **Ecosystem Projects** - Explore the Algorand ecosystem. Search projects by category, find open-source projects, and discover tools, wallets, DEXs, and more.
- **Algorand NFD Names** - Resolve addresses to NFD names, lookup addresses from names, and discover all NFDs owned by an address.

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
│   │   │   ├── ai-process/    # AI processing endpoints (swap, lending, trading, general)
│   │   │   ├── cross-chain/   # Cross-chain operations (OFT transfers)
│   │   │   ├── deposit-approve-cow/  # Safe wallet deposit & approve for CowSwap
│   │   │   ├── ecosystem-projects/   # Algorand ecosystem project explorer
│   │   │   ├── general/       # General AI assistant endpoint
│   │   │   ├── lending/       # Lending protocol data and recommendations
│   │   │   ├── native-swap/   # Native token swap operations
│   │   │   ├── nfd-names/     # NFD name resolution and lookup
│   │   │   ├── nft/           # NFT minting operations
│   │   │   ├── quotes/        # Price quotes across protocols
│   │   │   ├── setup-safe/    # Safe wallet setup and deployment
│   │   │   ├── swap-cow/      # CowSwap integration for EVM swaps
│   │   │   ├── trade/         # Trading operations and DEX data
│   │   │   └── wallet/        # Wallet registration and management
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page with wallet provider setup
│   ├── components/            # React components
│   │   ├── AIAgent.tsx        # Main AI agent component with all tab logic
│   │   ├── AlgorandWallet.tsx # Wallet connection component
│   │   ├── ResponseDisplay.tsx # Response rendering component
│   │   ├── WalletModal.tsx    # Wallet selection modal
│   │   ├── CustomConnect.tsx  # Custom wallet connection UI
│   │   ├── HardCodedReplys/   # Pre-defined responses for Algorand Helper
│   │   └── ui/                # UI components (shadcn/ui)
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       └── select.tsx
│   ├── lib/                   # Utility libraries
│   │   ├── abi.ts             # Contract ABIs (WETH, etc.)
│   │   ├── constants.ts       # Constants (addresses, chain IDs, etc.)
│   │   ├── db.ts              # MongoDB database connection
│   │   ├── deployment_config.ts  # Deployment configurations
│   │   ├── filebase.ts        # IPFS/filebase integration
│   │   ├── types.ts           # TypeScript type definitions
│   │   └── utils.ts           # General utility functions
│   ├── models/                # Data models
│   │   └── Wallet.ts          # Wallet model for database
│   ├── constant/              # Static data
│   │   └── projects.json      # Algorand ecosystem projects data
│   └── utils/                 # Utility functions
│       ├── ai.ts              # AI/LLM utilities (Hyperbolic API)
│       ├── helperFunction.ts  # Helper functions
│       ├── img-gen.ts         # Image generation (Venice AI)
│       ├── nfd.ts             # NFD registry utilities
│       ├── nfd-mint.ts        # NFD name NFT minting
│       └── prompt.ts          # Prompt formatting utilities
├── backend/                   # Backend scraper and data processor
│   ├── src/
│   │   ├── scraper.ts         # Web scraper for ecosystem data
│   │   └── data-processor.ts  # Data processing utilities
│   └── scraped-data/          # Scraped and processed data
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
  - **Algorand:** `algosdk`, `@txnlab/use-wallet-react`, `@algorandfoundation/algokit-utils`
- **AI/ML:** 
  - OpenAI API (via Hyperbolic.xyz)
  - Venice AI (for NFT image generation)
- **Storage:** 
  - Filebase (IPFS storage for NFT metadata and images)
  - MongoDB (for wallet registration and data persistence)
- **Data Sources:**
  - DefiLlama API (for lending and trading protocol data)
  - NFD Registry API (for Algorand Name resolution)
- **Wallets:** 
  - Defly, Pera, WalletConnect, Biatec, KMD, Kibisis, Lute, Magic
- **State Management:** TanStack Query (React Query)
- **UI Components:** Radix UI, shadcn/ui, Lucide React (icons)

---

## 🔐 Wallet Configuration

The application supports multiple Algorand wallet providers:

- **Defly Wallet**
- **Pera Wallet**
- **KMD** (Kibble)
- **Kibisis**
- **Lute**

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

### Without Wallet Connection

Try these prompts in the **General**, **Ecosystem Projects**, or **Algorand NFD Names** tabs:

**General Tab:**
- "What is Algorand?"
- "Explain how DeFi lending works"
- "How do I interact with smart contracts on Algorand?"

**Ecosystem Projects Tab:**
- "How many projects are in the Algorand ecosystem?"
- "Show me all wallets"
- "Find projects with GitHub repositories"
- "Show me projects in DeFi category"
- "Tell me about Pera Wallet"

**Algorand NFD Names Tab:**
- "Resolve address: [ALGORAND_ADDRESS]"
- "Lookup name: myname.algo"
- "Get all NFDs for address: [ALGORAND_ADDRESS]"

**Algorand Helper Tab:**
- "What are Algorand RPCs?"
- "Explain account abstraction on Algorand"
- "What oracles are available on Algorand?"
- "How do indexers work?"

### With Wallet Connection

Connect your wallet and try these example prompts:

**Swap & Trading:**
- "Swap 10 ALGO to USDC"
- "Get quotes for swapping ALGO to ETH"
- "Show me trading opportunities"

**Lending:**
- "Lend 100 ALGO on Folks Finance"
- "What are the best lending protocols?"
- "Show me lending rates"

**NFT & Tokens:**
- "Mint an NFT with the prompt 'A futuristic cityscape'"
- "Mint a token called MyToken with 1000000 supply"
- "Transfer 100 USDC to [ADDRESS]"
- "Send 50 ALGO to [ADDRESS]"

**Cross-Chain:**
- "Transfer tokens from Algorand to Ethereum"
- "Send OFT from chain 1 to chain 2"

**Coding Helper:**
- Type "generate_function" and provide a contract ABI JSON to get integration functions



## 📚 Feature Details

### NFD Names Integration
The application integrates with the Algorand NFD (Name) Registry to provide:
- **Address Resolution:** Convert Algorand addresses to human-readable NFD names
- **Reverse Lookup:** Find addresses from NFD names (e.g., `myname.algo`)
- **Multi-NFD Discovery:** Get all NFD names associated with a single address
- **View Types:** Support for tiny, thumbnail, brief, and full NFD data views

### Ecosystem Projects Explorer
A comprehensive database of Algorand ecosystem projects with:
- **Category Browsing:** Explore projects by category (Wallets, DEXs, DeFi, Tools, etc.)
- **Search Functionality:** Find projects by name or description
- **GitHub Integration:** Discover open-source projects with GitHub repositories
- **Project Details:** Get website links, descriptions, and categorization
- **Statistics:** View total project counts and category breakdowns

### Safe Wallet Integration
Enterprise-grade wallet security with:
- **Safe Deployment:** Automatically deploy Safe wallets for enhanced security
- **Multi-sig Support:** Configure owners and threshold for multi-signature wallets
- **DeFi Integration:** Deposit and approve tokens for DeFi operations via Safe
- **CowSwap Integration:** Execute swaps through Safe wallets for added security

### AI-Powered Features
- **Natural Language Processing:** Understand user intent from conversational prompts
- **Smart Routing:** Automatically route requests to appropriate blockchain operations
- **Context Awareness:** Maintain conversation context for follow-up questions
- **Code Generation:** Generate integration functions from contract ABIs automatically


---

## 📞 Support

For issues, questions, or contributions, please open an issue on the repository.

---

## 🎯 Roadmap

Future enhancements may include:
- Additional blockchain network support
- Enhanced cross-chain bridge integrations
- More DeFi protocol integrations
- Advanced trading strategies
- Portfolio management features
- Gas optimization tools

---

**Built with ❤️ for the Algorand ecosystem**
