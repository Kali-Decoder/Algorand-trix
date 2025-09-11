'use client'
import React, { useState, useEffect } from "react";
import { useWallet, type Wallet } from "@txnlab/use-wallet-react";
import { Modal } from "@/components/WalletModal";
import { Button } from "@/components/ui/button";

export function Connect() {
  const { algodClient, activeAddress, wallets } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  const handleConnect = () => setIsModalOpen(true);

  const handleDisconnect = () => {
    const activeWallet = wallets.find((wallet) => wallet.isConnected);
    if (activeWallet) activeWallet.disconnect();
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (activeAddress) {
        const accountInfo = await algodClient
          .accountInformation(activeAddress)
          .do();
        setBalance(Number(accountInfo.amount) / 1_000_000);
      } else {
        setBalance(null);
      }
    };
    fetchBalance();
  }, [activeAddress, algodClient]);

  return (
    <>
      {activeAddress ? (
        <div className="flex items-center">
          <Button
            onClick={handleDisconnect}
            variant="outline"
            className="flex items-center bg-transparent text-white gap-3 px-4 py-2"
          >
            {/* Green dot */}
            <div className="w-2 h-2 rounded-full bg-green-500" />

            {/* Address */}
            <span className="font-medium">
              {activeAddress.slice(0, 4)}...{activeAddress.slice(-4)}
            </span>

            {/* Divider */}
            <span className="text-gray-300">|</span>

            {/* Balance */}
            <span className="text-sm text-white">
              {balance !== null ? `${balance.toFixed(2)} ALGO` : "Loading..."}
            </span>
          </Button>
        </div>

      ) : (
        <div className="mt-4">
          <Button
            onClick={handleConnect}
            className="flex items-center gap-2 px-6 py-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="mr-1"
            >
              <path
                d="M21 18V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V6H12C10.9 6 10 6.9 10 8V16C10 17.1 10.9 18 12 18H21ZM12 16H22V8H12V16ZM16 13.5C15.17 13.5 14.5 12.83 14.5 12C14.5 11.17 15.17 10.5 16 10.5C16.83 10.5 17.5 11.17 17.5 12C17.5 12.83 16.83 13.5 16 13.5Z"
                fill="white"
              />
            </svg>
            Connect Your Wallet
          </Button>
        </div>
      )}

      {/* Wallet Select Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <WalletList onClose={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
}

function WalletList({ onClose }: { onClose: () => void }) {
  const { wallets } = useWallet();

  const handleConnect = async (wallet: Wallet) => {
    await wallet.connect();
    onClose();
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4 text-center">
        Connect Your Wallet
      </h2>
      <div className="space-y-3">
        {wallets.map((wallet) => (
          <button
            key={wallet.id}
            onClick={() => handleConnect(wallet)}
            className="flex w-full items-center justify-between px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
          >
            <span className="font-medium">{wallet.metadata.name}</span>
            <img
              src={wallet.metadata.icon}
              alt="wallet icon"
              className="w-6 h-6"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
