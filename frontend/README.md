# Buy Me A Coffee Frontend

A modern React frontend for the Buy Me A Coffee smart contract built with Stylus.

## Features

- 🦊 RainbowKit wallet connection
- ☕ Buy coffee with custom messages
- 📊 View donation statistics
- 👑 Owner withdrawal functionality
- 🎨 Beautiful UI with ShadCN components

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the frontend directory:
   ```bash
   VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```
   
   Get your project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)

3. **Update contract addresses:**
   After deploying your contract, update the contract addresses in `src/contracts/config.ts`

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Contract Deployment

Before using the frontend, you need to deploy your contract:

1. Deploy to Arbitrum Sepolia testnet:
   ```bash
   cd ../buy-me-a-coffe-contract
   cargo stylus deploy --private-key YOUR_PRIVATE_KEY --endpoint https://sepolia-rollup.arbitrum.io/rpc
   ```

2. Update the contract address in `src/contracts/config.ts`

## Usage

1. Connect your wallet using RainbowKit
2. Buy coffee by entering a message and ETH amount
3. View donation statistics
4. If you're the contract owner, withdraw funds

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- ShadCN UI
- Wagmi
- RainbowKit
- Viem