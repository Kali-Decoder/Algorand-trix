'use client'
import React, { useState, useEffect } from "react";
import { useWallet, type Wallet } from "@txnlab/use-wallet-react";
import { Modal } from "@/components/WalletModal";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export function Connect() {
  const { algodClient, activeAddress, wallets } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConnect = () => {
    console.log('Connect button clicked, opening modal...');
    console.log('Available wallets:', wallets);
    setIsModalOpen(true);
  };

  const handleDisconnect = () => {
    const activeWallet = wallets.find((wallet) => wallet.isConnected);
    if (activeWallet) activeWallet.disconnect();
  };

  const handleModalClose = () => {
    console.log('Modal close requested');
    setIsModalOpen(false);
  };

  const handleCopyAddress = async () => {
    if (activeAddress) {
      try {
        await navigator.clipboard.writeText(activeAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (activeAddress && algodClient) {
        try {
          const accountInfo = await algodClient
            .accountInformation(activeAddress)
            .do();
          setBalance(Number(accountInfo.amount) / 1_000_000);
        } catch (error) {
          console.error('Failed to fetch balance:', error);
          setBalance(null);
        }
      } else {
        setBalance(null);
      }
    };
    fetchBalance();
  }, [activeAddress, algodClient]);

  return (
    <>
      {activeAddress ? (
        <div className="w-full">
          <Button
            onClick={handleDisconnect}
            variant="outline"
            className="w-full flex items-center justify-between bg-transparent text-white gap-2 px-3 py-2 border-gray-500/20 "
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* Green dot */}
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />

              {/* Address */}
              <span className="font-medium text-xs truncate">
                {activeAddress.slice(0, 4)}...{activeAddress.slice(-4)}
              </span>

              {/* Divider */}
              <span className="text-gray-300 flex-shrink-0 text-xs">|</span>

              {/* Balance */}
              <span className="text-xs text-white truncate">
                {balance !== null ? `${balance.toFixed(2)} ALGO` : "Loading..."}
              </span>
            </div>

            {/* Copy Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopyAddress();
              }}
              className="p-1.5 rounded-lg bg-gray-500/20 text-white transition-all duration-200 border border-gray-500/20 hover:border-gray-500/40 flex-shrink-0"
              title="Copy wallet address"
              aria-label="Copy wallet address"
            >
              {copied ? (
                <Check size={14} className="text-green-400" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </Button>
        </div>

      ) : (
        <div className="w-full">
          <Button
            onClick={handleConnect}
            className="flex items-center gap-2 px-6 py-2 w-full"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="flex-shrink-0"
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
      <Modal isOpen={isModalOpen} onClose={handleModalClose}>
        <WalletList onClose={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
}

function WalletList({ onClose }: { onClose: () => void }) {
  const { wallets } = useWallet();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (wallet: Wallet) => {
    try {
      setConnecting(wallet.id);
      setError(null);
      
      console.log('Connecting to wallet:', wallet.metadata.name);
      console.log('Wallet object:', wallet);
      console.log('Wallet ID:', wallet.id);
      console.log('Wallet connected:', wallet.isConnected);
      
      // For Lute wallet, add special handling for chunk loading errors
      if (wallet.id === 'lute') {
        try {
          // Try to connect with a timeout
          const connectPromise = wallet.connect();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout. Please try again.')), 10000)
          );
          
          const result = await Promise.race([connectPromise, timeoutPromise]);
          console.log('Wallet connect result:', result);
        } catch (luteError: any) {
          // If it's a chunk loading error, provide helpful message
          if (luteError?.message?.includes('chunk') || luteError?.message?.includes('Failed to load')) {
            throw new Error('Lute wallet connection failed. Please refresh the page and try again. If the issue persists, try clearing your browser cache.');
          }
          throw luteError;
        }
      } else {
        // Connect to other wallets normally
        const result = await wallet.connect();
        console.log('Wallet connect result:', result);
      }
      
      console.log('Wallet connected successfully');
      
      // Close modal after successful connection
      setTimeout(() => {
        onClose();
        setConnecting(null);
      }, 500);
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      const errorMessage = error?.message || `Failed to connect to ${wallet.metadata.name}. Please try again.`;
      setError(errorMessage);
      setConnecting(null);
    }
  };

  if (wallets.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            No Wallets Found
          </h2>
          <p className="text-sm text-gray-500">
            Please install a wallet extension like Lute or Pera Wallet to continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Connect Your Wallet
        </h2>
        <p className="text-sm text-gray-500 text-center">
          Choose a wallet to connect to Algorand
        </p>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-4">
        {wallets.map((wallet) => {
          const isConnecting = connecting === wallet.id;
          const isConnected = wallet.isConnected;
          
          return (
            <button
              key={wallet.id}
              onClick={() => handleConnect(wallet)}
              disabled={isConnecting || isConnected}
              className={`
                group relative flex flex-col items-center justify-center gap-3 p-4 
                border-2 rounded-xl transition-all duration-200
                ${
                  isConnecting
                    ? 'border-blue-300 bg-blue-50 cursor-wait'
                    : isConnected
                      ? 'border-green-300 bg-green-50 cursor-default'
                      : 'border-gray-200 bg-white hover:border-blue-400  hover:shadow-md cursor-pointer'
                }
                disabled:opacity-75 disabled:cursor-not-allowed
              `}
            >
              {/* Wallet Icon */}
              <div className={`
                w-16 h-16 rounded-lg flex items-center justify-center
                transition-all duration-200
                ${
                  isConnecting
                    ? 'bg-blue-100'
                    : isConnected
                      ? 'bg-green-100'
                      : 'bg-gray-100 '
                }
              `}>
                <img
                  src={wallet.metadata.icon}
                  alt={wallet.metadata.name}
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    // Fallback icon if image fails to load
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      `;
                    }
                  }}
                />
              </div>

              {/* Wallet Name */}
              <div className="flex flex-col items-center gap-1 w-full">
                <h3 className="font-semibold text-gray-900 text-xs text-center">
                  {wallet.metadata.name}
                </h3>
                {isConnected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Connected
                  </span>
                )}
                {isConnecting && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          By connecting, you agree to the terms of service and privacy policy
        </p>
      </div>
    </div>
  );
}
