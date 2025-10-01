import { WsProvider } from '@polkadot/api';

export class NodeProvider {
  private nodeAddress: string;
  private static readonly DEFAULT_ADDRESS = 'ws://127.0.0.1:9944';

  constructor(nodeAddress: string = NodeProvider.DEFAULT_ADDRESS) {
    this.nodeAddress = nodeAddress;
  }

  setNodeAddress(address: string): void {
    this.nodeAddress = address;
  }

  getProvider(): WsProvider {
    return new WsProvider(this.nodeAddress);
  }

  getWhitelistAddresses(): string[] {
    return ['ws://127.0.0.1:9944'];
  }
}
