'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { WalletConnector } from '../lib/WalletConnect';
import { NodeProvider } from '../lib/NodeProvider';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { ApiPromise } from '@polkadot/api';

interface BalanceInfo {
  free: string;
  reserved: string;
  frozen: string;
}

const Wallet: React.FC = () => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null);
  const [balance, setBalance] = useState<BalanceInfo>({ free: '0', reserved: '0', frozen: '0' });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);

  const walletConnector = useMemo(() => new WalletConnector(), []);
  const nodeProvider = useMemo(() => new NodeProvider(), []);

  // Auto-connect on mount if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      const wasConnected = localStorage.getItem('walletConnected');
      const savedAddress = localStorage.getItem('selectedAddress');

      if (wasConnected === 'true') {
        try {
          const connectedAccounts = await walletConnector.connect();
          setAccounts(connectedAccounts);

          // Try to restore previously selected account
          if (savedAddress) {
            const savedAccount = connectedAccounts.find(acc => acc.address === savedAddress);
            setSelectedAccount(savedAccount || connectedAccounts[0]);
          } else {
            setSelectedAccount(connectedAccounts[0]);
          }

          setIsConnected(true);
        } catch (err) {
          console.error('Auto-connect failed:', err);
          localStorage.removeItem('walletConnected');
          localStorage.removeItem('selectedAddress');
        }
      }
    };

    autoConnect();
  }, [walletConnector]);

  const handleConnect = async () => {
    setIsLoading(true);
    setError('');

    try {
      const connectedAccounts = await walletConnector.connect();
      setAccounts(connectedAccounts);
      setSelectedAccount(connectedAccounts[0]); // Select first account by default
      setIsConnected(true);

      // Save connection state
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('selectedAddress', connectedAccounts[0].address);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setAccounts([]);
    setSelectedAccount(null);
    setIsConnected(false);
    setError('');
    setShowDropdown(false);

    // Clear connection state
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('selectedAddress');
  };

  const handleSelectAccount = (account: InjectedAccountWithMeta) => {
    setSelectedAccount(account);
    // Save selected account
    localStorage.setItem('selectedAddress', account.address);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  const handleAmountInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '.'];
    if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleSendTransaction = async () => {
    if (!selectedAccount || !recipientAddress || !amount) {
      setError('Please fill in all fields');
      return;
    }

    setIsSending(true);
    setError('');

    try {
      const provider = nodeProvider.getProvider();
      const api = await ApiPromise.create({ provider });

      // Get the decimals for the chain
      const decimals = api.registry.chainDecimals[0] || 12;
      const amountInSmallestUnit = BigInt(Math.floor(Number(amount) * Math.pow(10, decimals)));

      // Get injector for signing
      const { web3FromAddress } = await import('@polkadot/extension-dapp');
      const injector = await web3FromAddress(selectedAccount.address);

      // Create and send transfer
      const transfer = api.tx.balances.transferKeepAlive(recipientAddress, amountInSmallestUnit.toString());

      await new Promise((resolve, reject) => {
        transfer.signAndSend(
          selectedAccount.address,
          { signer: injector.signer },
          ({ status }) => {
            if (status.isInBlock || status.isFinalized) {
              console.log(`Transaction included in block hash: ${status.asInBlock || status.asFinalized}`);
              resolve(true);
            }
          }
        ).catch(reject);
      });

      // Clear inputs
      setRecipientAddress('');
      setAmount('');

      // Refresh balance
      const accountInfo = await api.query.system.account(selectedAccount.address);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const balanceData = (accountInfo as any).data;
      const divisor = Math.pow(10, decimals);
      const free = (Number(balanceData.free.toString()) / divisor).toFixed(4);
      const reserved = (Number(balanceData.reserved.toString()) / divisor).toFixed(4);
      const frozen = (Number(balanceData.frozen.toString()) / divisor).toFixed(4);
      setBalance({ free, reserved, frozen });

      await api.disconnect();
      setIsSending(false);
    } catch (err) {
      console.error('Transaction failed:', err);
      setError(err instanceof Error ? err.message : 'Transaction failed');
      setIsSending(false);
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (!selectedAccount) return;

      try {
        const provider = nodeProvider.getProvider();
        const api = await ApiPromise.create({ provider });
        const accountInfo = await api.query.system.account(selectedAccount.address);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const balanceData = (accountInfo as any).data;

        // Convert from smallest unit to main unit (divide by 10^decimals)
        const decimals = api.registry.chainDecimals[0] || 12;
        const divisor = Math.pow(10, decimals);

        const free = (Number(balanceData.free.toString()) / divisor).toFixed(4);
        const reserved = (Number(balanceData.reserved.toString()) / divisor).toFixed(4);
        const frozen = (Number(balanceData.frozen.toString()) / divisor).toFixed(4);

        setBalance({ free, reserved, frozen });
        await api.disconnect();
      } catch (err) {
        console.error('Failed to fetch balance:', err);
        setBalance({ free: '0', reserved: '0', frozen: '0' });
      }
    };

    fetchBalance();
  }, [selectedAccount, nodeProvider]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.wallet-dropdown-container')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div>
      {!isConnected ? (
        <button
          className="btn btn-primary fw-medium"
          onClick={handleConnect}
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="d-flex align-items-center gap-3 position-relative wallet-dropdown-container">
          <button
            className="btn btn-success fw-medium d-flex align-items-center gap-2"
            type="button"
            onClick={toggleDropdown}
          >
            <span>
              <strong>{selectedAccount?.meta.name || 'Unknown'}</strong>
              {' '}
              <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                ({selectedAccount?.address.slice(0, 6)}...{selectedAccount?.address.slice(-6)})
              </span>
            </span>
            <span>▼</span>
          </button>
          {showDropdown && (
            <ul className="dropdown-menu dropdown-menu-end show" style={{ position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem', minWidth: '250px' }}>
              {accounts.map((account) => (
                <li key={account.address}>
                  <div className="d-flex align-items-center">
                    <button
                      className={`dropdown-item flex-grow-1 ${selectedAccount?.address === account.address ? 'active' : ''}`}
                      onClick={() => handleSelectAccount(account)}
                      style={{ borderRadius: '0' }}
                    >
                      <strong>{account.meta.name || 'Unknown'}</strong>
                      <br />
                      <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                        {account.address.slice(0, 8)}...{account.address.slice(-8)}
                      </span>
                    </button>
                    <button
                      className="btn btn-sm btn-link text-secondary px-2"
                      onClick={() => copyToClipboard(account.address)}
                      title="Copy address"
                      style={{ fontSize: '1rem' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="2" y="2" width="9" height="9" rx="1" />
                        <path d="M5 13h7a2 2 0 0 0 2-2V5" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
              <li><hr className="dropdown-divider" /></li>
              <li className="px-3 py-2">
                <div className="small">
                  <div className="text-secondary mb-2 fw-semibold">Balance</div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-secondary">Free:</span>
                    <span className="fw-semibold">{Number(balance.free).toLocaleString('en-US')} POB</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-secondary">Reserved:</span>
                    <span className="fw-semibold">{Number(balance.reserved).toLocaleString('en-US')} POB</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-secondary">Locked:</span>
                    <span className="fw-semibold">{Number(balance.frozen).toLocaleString('en-US')} POB</span>
                  </div>
                </div>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li className="px-3 py-2">
                <div className="small">
                  <label htmlFor="walletAddress" className="form-label text-secondary mb-1">Address</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    id="walletAddress"
                    placeholder="Enter address..."
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                  />
                </div>
              </li>
              <li className="px-3 py-2">
                <div className="small">
                  <label htmlFor="walletInput" className="form-label text-secondary mb-1">Amount</label>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control form-control-sm flex-grow-1"
                      id="walletInput"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      onKeyDown={handleAmountInput}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      type="button"
                      onClick={handleSendTransaction}
                      disabled={isSending}
                    >
                      {isSending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item text-danger" onClick={handleDisconnect}>
                  Disconnect
                </button>
              </li>
            </ul>
          )}
        </div>
      )}

      {error && (
        <div className="alert alert-danger mt-2 mb-0 small" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default Wallet;
