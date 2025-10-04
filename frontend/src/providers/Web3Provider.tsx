import React from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, arbitrum, arbitrumSepolia } from "wagmi/chains";
import { http } from "viem";

// Note: ABI is imported in the hooks that need it

// Configure chains
const config = getDefaultConfig({
  appName: "Buy Me A Coffee",
  projectId: "YOUR_PROJECT_ID", // Get this from https://cloud.walletconnect.com
  chains: [mainnet, arbitrum, arbitrumSepolia],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
  batch: {
    multicall: {
      batchSize: 1024,
      wait: 16,
    },
  },
});

// Create a client
const queryClient = new QueryClient();

interface Web3ProviderProps {
  children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
