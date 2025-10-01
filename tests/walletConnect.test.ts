import { WalletConnector } from '../lib/WalletConnect';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

// Mock the @polkadot/extension-dapp module
jest.mock('@polkadot/extension-dapp');

const mockWeb3Enable = web3Enable as jest.MockedFunction<typeof web3Enable>;
const mockWeb3Accounts = web3Accounts as jest.MockedFunction<typeof web3Accounts>;

describe('WalletConnector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default app name', () => {
      const walletConnector = new WalletConnector();
      expect(walletConnector).toBeInstanceOf(WalletConnector);
    });

    it('should initialize with custom app name', () => {
      const customAppName = 'Custom DApp';
      const walletConnector = new WalletConnector(customAppName);
      expect(walletConnector).toBeInstanceOf(WalletConnector);
    });
  });

  describe('connect', () => {
    it('should successfully connect and return accounts', async () => {
      const mockAccounts: InjectedAccountWithMeta[] = [
        {
          address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          meta: {
            name: 'Alice',
            source: 'polkadot-js',
          },
          type: 'sr25519',
        },
        {
          address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
          meta: {
            name: 'Bob',
            source: 'polkadot-js',
          },
          type: 'sr25519',
        },
      ];

      mockWeb3Enable.mockResolvedValue([{ name: 'polkadot-js', version: '0.44.1' }] as any);
      mockWeb3Accounts.mockResolvedValue(mockAccounts);

      const walletConnector = new WalletConnector();
      const accounts = await walletConnector.connect();

      expect(mockWeb3Enable).toHaveBeenCalledWith('Probo DApp');
      expect(mockWeb3Accounts).toHaveBeenCalled();
      expect(accounts).toEqual(mockAccounts);
      expect(accounts).toHaveLength(2);
    });

    it('should throw error when no extension is found', async () => {
      mockWeb3Enable.mockResolvedValue([]);

      const walletConnector = new WalletConnector();

      await expect(walletConnector.connect()).rejects.toThrow(
        'No Polkadot extension found. Please install Polkadot.js extension.'
      );
    });

    it('should throw error when no accounts are found', async () => {
      mockWeb3Enable.mockResolvedValue([{ name: 'polkadot-js', version: '0.44.1' }] as any);
      mockWeb3Accounts.mockResolvedValue([]);

      const walletConnector = new WalletConnector();

      await expect(walletConnector.connect()).rejects.toThrow(
        'No accounts found in the extension.'
      );
    });

    it('should use custom app name when connecting', async () => {
      const customAppName = 'My Custom DApp';
      mockWeb3Enable.mockResolvedValue([{ name: 'polkadot-js', version: '0.44.1' }] as any);
      mockWeb3Accounts.mockResolvedValue([
        {
          address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          meta: { name: 'Alice', source: 'polkadot-js' },
          type: 'sr25519',
        },
      ]);

      const walletConnector = new WalletConnector(customAppName);
      await walletConnector.connect();

      expect(mockWeb3Enable).toHaveBeenCalledWith(customAppName);
    });
  });

  describe('getAccounts', () => {
    it('should return accounts from extension', async () => {
      const mockAccounts: InjectedAccountWithMeta[] = [
        {
          address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          meta: {
            name: 'Alice',
            source: 'polkadot-js',
          },
          type: 'sr25519',
        },
      ];

      mockWeb3Accounts.mockResolvedValue(mockAccounts);

      const walletConnector = new WalletConnector();
      const accounts = await walletConnector.getAccounts();

      expect(mockWeb3Accounts).toHaveBeenCalled();
      expect(accounts).toEqual(mockAccounts);
    });

    it('should return empty array when no accounts', async () => {
      mockWeb3Accounts.mockResolvedValue([]);

      const walletConnector = new WalletConnector();
      const accounts = await walletConnector.getAccounts();

      expect(accounts).toEqual([]);
      expect(accounts).toHaveLength(0);
    });
  });
});
