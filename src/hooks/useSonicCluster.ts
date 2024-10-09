"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useState, useMemo } from "react";

export enum SolanaClusterName {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  DEVNET = "devnet",
}

const HELIUS_API_KEY = "2db95077-90ac-433f-a13b-dbe4abcab384";

export const SONIC_CLUSTERS = {
  [SolanaClusterName.MAINNET]: {
    name: "Sonic Mainnet",
    endpoint: `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
    network: WalletAdapterNetwork.Mainnet,
    explorer: "",
  },
  [SolanaClusterName.TESTNET]: {
    name: "Sonic Testnet",
    endpoint: "https://api.testnet.sonic.game",
    network: WalletAdapterNetwork.Testnet,
    explorer: "https://explorer.dev2.eclipsenetwork.xyz",
  },
  [SolanaClusterName.DEVNET]: {
    name: "Sonic Devnet",
    endpoint: `https://devnet.sonic.game`,
    network: WalletAdapterNetwork.Devnet,
    explorer: "https://explorer.sonic.game",
  },
};

export function useSolanaCluster() {
  const [cluster, setCluster] = useState(
    SONIC_CLUSTERS[SolanaClusterName.DEVNET]
  );

  const endpoint = useMemo(() => cluster.endpoint, [cluster]);

  return {
    cluster,
    endpoint,
    setCluster: (name: SolanaClusterName) => setCluster(SONIC_CLUSTERS[name]),
  };
}
