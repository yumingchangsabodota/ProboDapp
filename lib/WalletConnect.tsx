import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

export class WalletConnector {
  private appName: string;

  constructor(appName: string = 'Probo DApp') {
    this.appName = appName;
  }

  async connect(): Promise<InjectedAccountWithMeta[]> {
    const extensions = await web3Enable(this.appName);

    if (extensions.length === 0) {
      throw new Error('No Polkadot extension found. Please install Polkadot.js extension.');
    }

    const accounts = await web3Accounts();

    if (accounts.length === 0) {
      throw new Error('No accounts found in the extension.');
    }

    return accounts;
  }

  async getAccounts(): Promise<InjectedAccountWithMeta[]> {
    return await web3Accounts();
  }
}
