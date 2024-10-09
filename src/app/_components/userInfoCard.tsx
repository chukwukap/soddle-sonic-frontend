"use client";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState, useCallback } from "react";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useSolanaCluster } from "@/hooks/useSonicCluster";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function UserInfoCard() {
  const { publicKey, disconnect, connecting, connected, wallet, select } =
    useWallet();

  const [balance, setBalance] = useState<number | null>(null);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const { endpoint, cluster } = useSolanaCluster();
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
  const { setVisible } = useWalletModal();

  const handleConnectWallet = () => {
    if (connected) {
      disconnect();
    } else {
      setVisible(true);
    }
  };

  const fetchBalance = useCallback(async () => {
    if (!publicKey) return;

    const connection = new Connection(endpoint);

    try {
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
      setCountdown(REFRESH_INTERVAL / 1000);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  }, [publicKey, endpoint]);

  const fetchSolPrice = useCallback(async () => {
    try {
      const response = await fetch(
        "https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT"
      );
      const data = await response.json();
      setSolPrice(parseFloat(data.price));
    } catch (error) {
      console.error("Error fetching SOL price:", error);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchSolPrice();
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : REFRESH_INTERVAL / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchBalance, fetchSolPrice]);

  useEffect(() => {
    if (countdown === 0) {
      fetchBalance();
      fetchSolPrice();
    }
  }, [countdown, fetchBalance, fetchSolPrice]);

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      toast.success("Copied to clipboard");
    }
  };

  if (!connected && connecting) return <Skeleton />;
  if (!wallet) return <NoWallet handleConnectWallet={handleConnectWallet} />;

  return (
    <div
      className="p-5 grid gap-5 border-[#03B500] border text-white bg-[#111411] relative"
      style={{
        clipPath: "polygon(5% 0%, 100% 0, 100% 80%, 95% 100%, 0 100%, 0 20%)",
      }}
    >
      <div className="flex items-center">
        <Link href={"/profile"}>
          <Image
            src="/user-icon.svg"
            width={25}
            height={25}
            alt="user"
            className="mr-2 w-10 h-10 cursor-pointer"
          />
        </Link>

        <Tooltip>
          <TooltipTrigger>
            <p
              onClick={copyAddress}
              className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg 2xl:text-xl "
            >
              {publicKey ? shortenAddress(publicKey.toBase58(), 4) : "..."}
            </p>
          </TooltipTrigger>
          <TooltipContent>
            <p>{publicKey?.toBase58()}</p>
          </TooltipContent>
        </Tooltip>
        <p className="ml-2 text-sm">({cluster.name})</p>

        <Image
          src={"/logout.svg"}
          width={30}
          height={30}
          alt="Logout"
          className="ml-auto w-10 h-10 cursor-pointer"
          onClick={disconnect}
        />
      </div>
      <div className="flex gap-3 items-center">
        <div className="flex items-center justify-center">
          <Image
            src={"/solana.svg"}
            width={25}
            height={25}
            alt="ETH icon"
            className="mr-1"
          />
          <span>Sol</span>
        </div>
        <div className="flex items-center justify-center">
          <span className="text-3xl font-bold">
            {balance !== null ? balance.toFixed(2) : "..."}
          </span>
          <span className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl mx-1">
            ~ $
          </span>
          <span className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl">
            {balance !== null && solPrice !== null
              ? (balance * solPrice).toFixed(2)
              : "..."}
          </span>
        </div>
        <Link href="/leaderboard" className="flex-1">
          <button className="w-full bg-[#181716] border-2 border-[#2A342A] text-white py-1 px-2 text-sm font-semibold uppercase tracking-wider  transition-colors ">
            Leaderboard
          </button>
        </Link>
      </div>
    </div>
  );
}

function NoWallet({
  handleConnectWallet,
}: {
  handleConnectWallet: () => void;
}) {
  return (
    <div
      className="p-5 grid gap-3 border-[#03B500] border text-white bg-[#111411] items-center"
      style={{
        clipPath: "polygon(5% 0%, 100% 0, 100% 80%, 95% 100%, 0 100%, 0 20%)",
      }}
    >
      <div className="flex items-center">
        <p className="w-full bg-[#181716] border border-[#2A342A] text-white py-1 px-2 text-sm font-semibold uppercase tracking-wider  transition-colors ">
          No wallet connected
        </p>
      </div>
      <button
        className="bg-[#111411] border border-[#03B500] border-opacity-50 p-2 text-white text-lg transition-all duration-300 ease-in-out hover:drop-shadow-[0_0_10px_rgba(47,255,43,1)] hover:shadow-[0_0_20px_rgba(47,255,43,0.5)]"
        onClick={handleConnectWallet}
      >
        click to connect wallet
      </button>
    </div>
  );
}

function Skeleton() {
  return (
    <div
      className="p-5 grid gap-5 border-[#03B500] border bg-[#111411] relative overflow-hidden animate-pulse"
      style={{
        clipPath: "polygon(5% 0%, 100% 0, 100% 80%, 95% 100%, 0 100%, 0 20%)",
      }}
    >
      <div className="flex items-center">
        <div className="w-10 h-10 bg-green-700 rounded-full mr-2"></div>
        <div className="h-6 w-32 bg-green-700 rounded"></div>
        <div className="ml-auto w-10 h-10 bg-green-700 rounded"></div>
      </div>
      <div className="flex gap-3">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 bg-green-700 rounded-full mr-2"></div>
          <div className="h-4 w-8 bg-green-700 rounded"></div>
        </div>
        <div className="flex items-center justify-center">
          <div className="h-8 w-20 bg-green-700 rounded mr-2"></div>
          <div className="h-6 w-24 bg-green-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";

  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
