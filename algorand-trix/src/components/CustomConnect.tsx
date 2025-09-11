import { ConnectButton } from '@rainbow-me/rainbowkit';
import React, { useEffect, useState } from 'react';

export const CustomConnect = () => {
  // Common button styles for consistency
  const buttonStyles = {
    backgroundColor: '#121212',
    color: 'white',
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #333',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  };

  const hoverStyles = {
    backgroundColor: '#1e1e1e',
    borderColor: '#555',
  };

  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);

  // Add the loginWallet function
  const loginWallet = async (address: string) => {
    const res = await fetch('/api/wallet', {
      method: 'POST',
      body: JSON.stringify({ address }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    console.log(data);
  };

  // Use effect outside of the callback
  useEffect(() => {
    if (currentAccount) {
      loginWallet(currentAccount);
    }
  }, [currentAccount]);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        // Update account state when connected
        // This is safe as it's not a hook, just a state update
        if (connected && account?.address !== currentAccount) {
          setCurrentAccount(account.address);
        } else if (!connected && currentAccount !== null) {
          setCurrentAccount(null);
        }

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {(() => {
              if (!connected) {
                return (
                  <button 
                    onClick={openConnectModal} 
                    type="button"
                    style={{
                      ...buttonStyles,
                      ...(hoveredButton === 'connect' ? hoverStyles : {}),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onMouseEnter={() => setHoveredButton('connect')}
                    onMouseLeave={() => setHoveredButton(null)}
                    className='w-full items-center flex justify-center'
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                      <path d="M21 18V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V6H12C10.9 6 10 6.9 10 8V16C10 17.1 10.9 18 12 18H21ZM12 16H22V8H12V16ZM16 13.5C15.17 13.5 14.5 12.83 14.5 12C14.5 11.17 15.17 10.5 16 10.5C16.83 10.5 17.5 11.17 17.5 12C17.5 12.83 16.83 13.5 16 13.5Z" fill="white"/>
                    </svg>
                    Connect Wallet
                  </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <button 
                    onClick={openChainModal} 
                    type="button"
                    style={{
                      ...buttonStyles,
                      ...(hoveredButton === 'wrong' ? hoverStyles : {}),
                      backgroundColor: '#4a1d1d',
                      borderColor: '#6e3838',
                    }}
                    onMouseEnter={() => setHoveredButton('wrong')}
                    onMouseLeave={() => setHoveredButton(null)}
                    className='w-full flex items-center justify-center'
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" fill="#FF6B6B"/>
                    </svg>
                    Wrong Network
                  </button>
                );
              }
              return (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={openAccountModal} 
                    type="button"
                    style={{
                      ...buttonStyles,
                      ...(hoveredButton === 'account' ? hoverStyles : {}),
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onMouseEnter={() => setHoveredButton('account')}
                    onMouseLeave={() => setHoveredButton(null)}
                    className='w-full items-center flex justify-center'
                  >
                    <div 
                      style={{ 
                        width: '8px', 
                        height: '8px', 
                        backgroundColor: '#4ade80', 
                        borderRadius: '50%', 
                        marginRight: '8px',
                      }}
                    />
                    <div className='w-full'>
                      <span style={{ fontWeight: 'bold' }}>{account.displayName}</span>
                      {account.displayBalance && (
                        <span style={{ opacity: 0.8, marginLeft: '6px', fontSize: '13px' }}>
                          {account.displayBalance}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};