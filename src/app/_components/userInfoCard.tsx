"use client";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEclipseCluster } from "@/hooks/useEclipseCluster";
import { WalletIcon } from "@heroicons/react/24/outline";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

export default function UserInfoCard() {
  const { publicKey, disconnect, connecting, connected, wallet } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const { endpoint, cluster } = useEclipseCluster();

  const { setVisible } = useWalletModal();

  const handleConnectWallet = () => {
    if (connected) {
      disconnect();
    } else {
      setVisible(true);
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) return;

      const connection = new Connection(endpoint);

      try {
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, [publicKey, endpoint]);

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
        <Image
          src="/user-icon.svg"
          width={25}
          height={25}
          alt="user"
          className="mr-2 w-10 h-10 cursor-pointer"
        />
        <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl ">
          {publicKey ? shortenAddress(publicKey.toBase58(), 4) : "..."}
        </p>
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
      <div className="flex gap-3">
        <div className="flex items-center justify-center">
          <Image src={"/ethereum.svg"} width={25} height={25} alt="ETH icon" />
          <span>ETH</span>
        </div>
        <div className="flex items-center justify-center">
          <span className="text-3xl font-bold">
            {balance !== null ? balance.toFixed(2) : "..."}
          </span>
          <span className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl mx-1">
            ~ $
          </span>
          <span className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl">
            {balance !== null ? (balance * 5000).toFixed(2) : "..."}
          </span>
        </div>
        <Link href="/leaderboard" className="">
          <button className="w-full bg-[#181716] border border-[#2A342A] text-white py-1 px-2 text-sm font-semibold uppercase tracking-wider hover:text-white hover:border-white transition-colors duration-300">
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
        <WalletIcon className="w-8 h-8 mr-2 text-[#03B500]" />
        <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl">
          No Wallet Connected
        </p>
      </div>
      <button
        className="bg-[#03B500] text-white py-2 px-4 rounded-md hover:bg-[#029400] transition-colors duration-200 text-sm sm:text-base flex items-center justify-center"
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
